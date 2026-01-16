import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Load Environment Variables
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox"; // Defaults to sandbox if missing

    // Debugging logs (optional, remove in production if preferred)
    console.log("DEBUG CHECK:");
    console.log("- CASHFREE_KEY exists?", !!envKey);
    console.log("- CASHFREE_SECRET exists?", !!envSecret);
    console.log("- Environment:", cashfreeEnv);

    if (!envSecret || !envKey) {
      throw new Error("CRITICAL: Cashfree API Keys are missing from Environment Variables!");
    }

    // 2. Parse Request Body
    const { courseId, amount, userId, customerPhone, customerEmail } = await req.json();

    // 3. Set API URL based on Environment
    const cashfreeApiUrl = cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // 4. Prepare Order Payload
    const orderId = `order_${Date.now()}_${userId}`;
    const validPhone = (customerPhone && customerPhone.length >= 10) ? customerPhone : "9999999999";
    const validEmail = customerEmail || "test@example.com";

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
        return_url: `${Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321"}/functions/v1/verify-cashfree-payment?order_id={order_id}`,
      },
    };

    console.log("Sending to Cashfree:", JSON.stringify(orderPayload));

    // 5. Call Cashfree API
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
      console.error("Cashfree API Failure:", errorBody);
      throw new Error(`Cashfree Rejected Request: ${errorBody}`);
    }

    const orderData = await cashfreeResponse.json();

    // 6. Save Enrollment to Database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      amount: amount,
      order_id: orderId,
      status: "pending",
    });

    // 7. Return Response with Environment
    // CRITICAL: We return 'environment' so the frontend knows which mode to use.
    return new Response(JSON.stringify({ ...orderData, environment: cashfreeEnv }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
