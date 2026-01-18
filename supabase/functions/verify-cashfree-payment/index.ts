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

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const passedRedirectUrl = url.searchParams.get("redirect_url");
  const frontendUrl = passedRedirectUrl ? decodeURIComponent(passedRedirectUrl) : "https://preview.lovable.app";

  try {
    if (!orderId) {
      console.error("Order ID not found.");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=missing_order_id` },
      });
    }

    if (!cashfreeKey || !cashfreeSecret) {
      console.error("Cashfree API keys missing.");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=config_error` },
      });
    }

    // 1. Verify with Cashfree
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
      console.error("Cashfree verification failed");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=verification_failed` },
      });
    }

    const paymentData = await verifyResponse.json();
    const finalStatus = paymentData.order_status === "PAID" ? "success" : "failed";
    const userId = paymentData.customer_details?.customer_id;

    // 2. Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Fetch Course & Addon Details
    // We join 'enrollments' with 'courses' to get the main batch title.
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        subject_name,
        courses (
          title
        )
      `)
      .eq("order_id", orderId)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Error fetching enrollment:", enrollmentError);
    }

    // Prepare data for the specific columns
    const mainBatchName = enrollmentData?.courses?.title || "Unknown Batch";
    const addonsNames = enrollmentData?.subject_name || ""; // This comes from course_addons logic stored in enrollments

    // 4. Insert into 'payments' with new columns
    const { error: paymentInsertError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        payment_id: paymentData.cf_order_id || null,
        user_id: userId,
        amount: paymentData.order_amount,
        status: finalStatus,
        payment_mode: paymentData.payment_session_id ? "session" : "unknown",
        raw_response: paymentData,
        
        // --- NEW COLUMNS POPULATED HERE ---
        batch: mainBatchName,  // Main batch name from 'courses' table
        courses: addonsNames   // Course/Addon names (stored in subject_name)
      });

    if (paymentInsertError) {
      console.error("Error inserting payment:", paymentInsertError);
    } else {
      console.log(`Payment saved: Batch=[${mainBatchName}], Courses=[${addonsNames}]`);
    }

    // 5. Update Enrollments Status
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: finalStatus,
        payment_id: paymentData.cf_order_id,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Error updating enrollment:", updateError);
    }

    // 6. Redirect
    const redirectUrl = finalStatus === "success"
      ? `${frontendUrl}/dashboard?payment=success`
      : `${frontendUrl}/dashboard?payment=failed`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `${frontendUrl}/dashboard?payment=error&message=unknown_error` },
    });
  }
});
