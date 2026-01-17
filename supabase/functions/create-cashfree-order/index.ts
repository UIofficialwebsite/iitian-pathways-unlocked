import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Load Secrets
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!envSecret || !envKey) throw new Error("Cashfree keys missing in Supabase Secrets");

    // 2. Parse Input
    const { 
      courseId, 
      selectedSubjects, // Ensure this matches what Frontend sends
      amount, 
      userId, 
      customerPhone, 
      customerEmail 
    } = await req.json();

    const orderId = `order_${Date.now()}_${userId}`;
    const validPhone = (customerPhone && customerPhone.length >= 10) ? customerPhone : "9999999999";

    // 3. Create Cashfree Order
    const cashfreeResponse = await fetch(
      cashfreeEnv === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": envKey,
          "x-client-secret": envSecret,
          "x-api-version": "2023-08-01",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: amount,
          order_currency: "INR",
          customer_details: {
            customer_id: userId,
            customer_phone: validPhone,
            customer_email: customerEmail || "test@example.com",
          },
          order_meta: {
            return_url: `${supabaseUrl}/functions/v1/verify-cashfree-payment?order_id={order_id}`,
          },
        }),
      }
    );

    if (!cashfreeResponse.ok) {
      const errText = await cashfreeResponse.text();
      console.error("Cashfree Error:", errText);
      throw new Error(`Cashfree API Error: ${errText}`);
    }

    const orderData = await cashfreeResponse.json();

    // 4. Save to Database (USING RPC TO AVOID 500 ERRORS)
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.rpc('enroll_student_with_addons', {
      p_user_id: userId,
      p_course_id: courseId,
      p_addon_subjects: selectedSubjects || [], 
      p_order_id: orderId,
      p_payment_id: null, 
      p_total_amount: amount,
      p_status: 'pending'
    });

    if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error("Database Save Failed: " + dbError.message);
    }

    return new Response(JSON.stringify({ ...orderData, environment: cashfreeEnv }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, // This is the 500 you are seeing
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
