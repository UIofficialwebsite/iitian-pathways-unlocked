import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!envSecret || !envKey) throw new Error("CRITICAL: Cashfree API Keys are missing!");

    // 1. Get Inputs from Frontend
    const { 
      courseId,             
      selectedSubjects,     // <--- Array of STRINGS e.g. ["Python", "Stats"]
      amount, 
      userId, 
      customerPhone,
      customerEmail
    } = await req.json();

    const orderId = `order_${Date.now()}_${userId}`;
    const validPhone = (customerPhone && customerPhone.length >= 10) ? customerPhone : "9999999999";
    const validEmail = customerEmail || "test@example.com";

    // 2. Prepare Cashfree Payload
    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_phone: validPhone,
        customer_email: validEmail,
      },
      order_meta: {
        return_url: `${supabaseUrl}/functions/v1/verify-cashfree-payment?order_id={order_id}`,
      },
    };

    console.log("Sending to Cashfree:", JSON.stringify(orderPayload));

    // 3. Call Cashfree
    const cashfreeApiUrl = cashfreeEnv === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";
    const cashfreeResponse = await fetch(cashfreeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": envKey,
        "x-client-secret": envSecret,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!cashfreeResponse.ok) {
      const errorBody = await cashfreeResponse.text();
      throw new Error(`Cashfree Rejected: ${errorBody}`);
    }

    const orderData = await cashfreeResponse.json();

    // 4. Save to Database using the NEW simplified function
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.rpc('enroll_student_with_addons', {
      p_user_id: userId,
      p_course_id: courseId,
      p_addon_subjects: selectedSubjects || [], // Passing ["Python"]
      p_order_id: orderId,
      p_payment_id: null, 
      p_total_amount: amount,
      p_status: 'pending'
    });

    if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error("Enrollment Record Failed");
    }

    return new Response(JSON.stringify({ ...orderData, environment: cashfreeEnv }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
