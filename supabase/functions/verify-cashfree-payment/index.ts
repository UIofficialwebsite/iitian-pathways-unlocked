import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    const cashfreeKey = Deno.env.get("Cashfree_Key");
    const cashfreeSecret = Deno.env.get("Cashfree_Secret");
    
    if (!cashfreeKey || !cashfreeSecret) {
      throw new Error("Cashfree credentials not configured");
    }

    // Verify payment with Cashfree
    const verifyResponse = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "x-client-id": cashfreeKey,
          "x-client-secret": cashfreeSecret,
          "x-api-version": "2023-08-01",
        },
      }
    );

    if (!verifyResponse.ok) {
      throw new Error("Failed to verify payment");
    }

    const paymentData = await verifyResponse.json();
    
    // Update enrollment status in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const status = paymentData.order_status === "PAID" ? "completed" : "failed";
    
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: status,
        payment_id: paymentData.cf_order_id,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Failed to update enrollment status");
    }

    return new Response(
      JSON.stringify({
        status: status,
        paymentData: paymentData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in verify-cashfree-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
