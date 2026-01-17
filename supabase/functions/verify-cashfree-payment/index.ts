import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cashfreeKey = Deno.env.get("CASHFREE_KEY");
const cashfreeSecret = Deno.env.get("CASHFREE_SECRET");
const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse URL and Redirect URL
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const passedRedirectUrl = url.searchParams.get("redirect_url");
  
  // Default fallback if no redirect URL passed
  const frontendUrl = passedRedirectUrl ? decodeURIComponent(passedRedirectUrl) : "https://preview.lovable.app";

  try {
    if (!orderId) {
      console.error("Order ID not found in the return URL.");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=missing_order_id` },
      });
    }

    console.log(`Verifying payment for order: ${orderId}`);

    if (!cashfreeKey || !cashfreeSecret) {
      console.error("Cashfree API Key or Secret is not configured.");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=config_error` },
      });
    }

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
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=verification_failed` },
      });
    }

    const paymentData = await verifyResponse.json();
    console.log("Cashfree Payment Data:", JSON.stringify(paymentData, null, 2));

    // FIX: Map "PAID" to "success" (lowercase) to match Frontend logic
    const finalStatus = paymentData.order_status === "PAID" ? "success" : "failed";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update DB and select count to verify it worked
    const { data, error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: finalStatus,
        payment_id: paymentData.cf_order_id,
      })
      .eq("order_id", orderId)
      .select();

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=db_error` },
      });
    }

    // Check if any row was actually updated
    if (!data || data.length === 0) {
      console.error(`No enrollment found with order_id: ${orderId}. Database update likely missed.`);
      // We still redirect to success if paid, but warn in logs. 
      // This implies the 'enrollments' table might not have 'order_id' column populated correctly.
    } else {
      console.log(`Successfully updated ${data.length} row(s) for order ${orderId} to status: ${finalStatus}`);
    }

    // Redirect to dashboard with success or failure status
    const redirectUrl = finalStatus === "success"
      ? `${frontendUrl}/dashboard?payment=success`
      : `${frontendUrl}/dashboard?payment=failed`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in verify-cashfree-payment function:", errorMessage);
    return new Response(null, {
      status: 302,
      headers: { Location: `${frontendUrl}/dashboard?payment=error&message=unknown_error` },
    });
  }
});
