import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- IMPORTANT: ENSURE THESE SECRETS MATCH THE create-cashfree-order FUNCTION ---
const cashfreeKey = Deno.env.get("CASHFREE_KEY");
const cashfreeSecret = Deno.env.get("CASHFREE_SECRET");
const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the order_id from the URL query parameter
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      throw new Error("Order ID not found in the return URL.");
    }

    console.log(`Verifying payment for order: ${orderId}`);

    // 2. Check for valid credentials
    if (!cashfreeKey || !cashfreeSecret) {
      console.error("Cashfree API Key or Secret is not configured.");
      throw new Error("Payment provider credentials are not configured.");
    }

    // 3. Determine API endpoint and make the verification call
    const cashfreeApiUrl = cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    const verifyResponse = await fetch(`${cashfreeApiUrl}/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": cashfreeKey,
        "x-client-secret": cashfreeSecret,
        "x-api-version": "2023-08-01",
      },
    });

    if (!verifyResponse.ok) {
      const errorBody = await verifyResponse.text();
      console.error("Cashfree verification failed with status:", verifyResponse.status);
      console.error("Cashfree Verification Error Body:", errorBody);
      throw new Error("Failed to verify payment with Cashfree.");
    }

    const paymentData = await verifyResponse.json();
    console.log("Cashfree Payment Data:", JSON.stringify(paymentData, null, 2));


    // 4. Determine the final status of the payment
    const finalStatus = paymentData.order_status === "PAID" ? "completed" : "failed";

    // 5. Update the order status in your database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: finalStatus,
        payment_id: paymentData.cf_order_id, // Store the Cashfree transaction ID
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Failed to update enrollment status in the database.");
    }

    console.log(`Successfully updated order ${orderId} to status: ${finalStatus}`);

    // 6. Respond with the final status
    // In a real app, you would likely redirect the user to a success or failure page.
    // For an API, returning the status is appropriate.
    return new Response(JSON.stringify({ status: finalStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in verify-cashfree-payment function:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
