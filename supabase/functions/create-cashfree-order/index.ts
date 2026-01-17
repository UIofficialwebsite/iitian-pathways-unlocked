import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";

    if (!envSecret || !envKey) {
      throw new Error("CRITICAL: Cashfree API Keys are missing!");
    }

    // --- UPDATED: Accept courseIds (Array) OR courseId (Single) ---
    const { courseIds, courseId, amount, userId, customerPhone, customerEmail } = await req.json();

    // Normalize to an array: If courseIds exists, use it; otherwise wrap courseId
    const targetCourseIds = courseIds && Array.isArray(courseIds) ? courseIds : [courseId];

    if (targetCourseIds.length === 0 || !targetCourseIds[0]) {
        throw new Error("No course IDs provided for enrollment");
    }

    const cashfreeApiUrl = cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Create a Unique Order ID
    const orderId = `order_${Date.now()}_${userId}`;
    const validPhone = (customerPhone && customerPhone.length >= 10) ? customerPhone : "9999999999";
    const validEmail = customerEmail || "test@example.com";

    // 1. Prepare Cashfree Payload
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

    // 2. Call Cashfree API
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

    // 3. Save Multiple Enrollments to Database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create an array of rows to insert
    const enrollmentRows = targetCourseIds.map((id: string, index: number) => ({
        user_id: userId,
        course_id: id,
        // We store the full amount on the first course (Main Course)
        // and 0 on the add-ons to avoid inflating your revenue stats.
        amount: index === 0 ? amount : 0, 
        order_id: orderId,
        status: "pending",
    }));

    const { error: insertError } = await supabase.from("enrollments").insert(enrollmentRows);

    if (insertError) {
        console.error("DB Insert Error:", insertError);
        throw new Error("Failed to create enrollment records");
    }

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
