import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 1. Handle CORS Pre-flight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Initialize Environment Variables
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!envSecret || !envKey) {
      throw new Error("Cashfree keys missing in Supabase Secrets");
    }

    // 3. Capture the Origin (Frontend URL)
    // This ensures we redirect back to localhost or the live site dynamically
    const origin = req.headers.get("origin") || "https://preview.lovable.app";

    // 4. Parse Request Body
    const { 
      courseId, 
      selectedSubjects, 
      amount, 
      userId, 
      customerPhone, 
      customerEmail 
    } = await req.json();

    const orderId = `order_${Date.now()}_${userId}`;
    
    // 5. Construct the Verification URL
    // This is the CRITICAL part: We point Cashfree to our Edge Function, NOT the dashboard directly.
    const verifyUrl = `${supabaseUrl}/functions/v1/verify-cashfree-payment?order_id=${orderId}&redirect_url=${encodeURIComponent(origin)}`;

    // 6. Call Cashfree API to Create Order
    const cashfreeApiUrl = cashfreeEnv === "production" 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    const cashfreeResponse = await fetch(cashfreeApiUrl, {
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
          customer_phone: customerPhone || "9999999999",
          customer_email: customerEmail || "test@example.com",
        },
        order_meta: {
          return_url: verifyUrl, // Fallback return URL
        },
      }),
    });

    if (!cashfreeResponse.ok) {
      const errText = await cashfreeResponse.text();
      throw new Error(`Cashfree API Error: ${errText}`);
    }

    const orderData = await cashfreeResponse.json();

    // 7. Save Pending Enrollment to Database
    const supabase = createClient(supabaseUrl, supabaseKey);

    // We use the new 'enroll_student_with_addons' function that handles UPSERT/Upgrades
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
      // Pass the actual DB error message to the frontend for debugging
      throw new Error(`DB Error: ${dbError.message}`);
    }

    // 8. Return Success Response
    // We send 'verifyUrl' back so the Frontend can use it as the redirect target
    return new Response(JSON.stringify({ 
      ...orderData, 
      environment: cashfreeEnv,
      verifyUrl: verifyUrl 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("FULL ERROR DETAILS:", error);
    
    // Return a structured JSON error so the frontend can parse it
    return new Response(JSON.stringify({ 
      error: error.message, 
      details: error.stack || "No stack trace available"
    }), {
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
