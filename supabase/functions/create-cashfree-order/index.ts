import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  courseId: string;
  amount: number;
  userId: string;
  customerPhone: string; // Added to receive customer's phone number
}

// Determine the environment and set the correct Cashfree URL
const isProduction = Deno.env.get("CASHFREE_PROD") === "true";
const cashfreeApiUrl = isProduction
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, amount, userId, customerPhone }: OrderRequest = await req.json();

    const cashfreeKey = Deno.env.get("Cashfree_Key");
    const cashfreeSecret = Deno.env.get("Cashfree_Secret");

    if (!cashfreeKey || !cashfreeSecret) {
      throw new Error("Cashfree credentials not configured");
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Cashfree order
    const cashfreeResponse = await fetch(cashfreeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cashfreeKey,
        "x-client-secret": cashfreeSecret,
        "x-api-version": "2023-08-01", // It's a good practice to keep this in an environment variable as well
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_phone: customerPhone, // Use the phone number from the request
        },
        order_meta: {
          return_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-cashfree-payment?order_id={order_id}`,
          notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-cashfree-payment`,
        },
      }),
    });

    if (!cashfreeResponse.ok) {
      const errorText = await cashfreeResponse.text();
      console.error("Cashfree API error:", errorText);
      throw new Error("Failed to create Cashfree order");
    }

    const orderData = await cashfreeResponse.json();

    // Store order in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      amount: amount,
      order_id: orderId,
      status: "pending",
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store order");
    }

    return new Response(
      JSON.stringify({
        orderId: orderId,
        paymentSessionId: orderData.payment_session_id,
        orderToken: orderData.order_token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-cashfree-order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
