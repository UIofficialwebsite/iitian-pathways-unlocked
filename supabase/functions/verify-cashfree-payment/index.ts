import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cashfreeKey = Deno.env.get("CASHFREE_KEY");
const cashfreeSecret = Deno.env.get("CASHFREE_SECRET");
const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const passedRedirectUrl = url.searchParams.get("redirect_url");
  const frontendUrl = passedRedirectUrl ? decodeURIComponent(passedRedirectUrl) : "https://preview.lovable.app";

  try {
    // 1. CRITICAL: Check for Service Role Key
    // If this is missing, the DB client will fail to bypass RLS.
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ FATAL: Supabase URL or Service Role Key is missing in Secrets!");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=server_config_error` },
      });
    }

    if (!orderId) {
      console.error("❌ Order ID not found in URL");
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=missing_order_id` },
      });
    }

    // 2. Initialize Supabase Admin Client
    // using 'auth: { persistSession: false }' ensures it acts purely as a backend admin
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 3. Verify with Cashfree
    const cashfreeApiUrl = cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    const verifyResponse = await fetch(`${cashfreeApiUrl}/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": cashfreeKey || "",
        "x-client-secret": cashfreeSecret || "",
        "x-api-version": "2023-08-01",
      },
    });

    if (!verifyResponse.ok) {
      console.error("❌ Cashfree API Verification Failed:", verifyResponse.status);
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendUrl}/dashboard?payment=error&message=verification_failed` },
      });
    }

    const paymentData = await verifyResponse.json();
    const finalStatus = paymentData.order_status === "PAID" ? "success" : "failed";
    const userId = paymentData.customer_details?.customer_id;

    console.log(`✅ Payment Verified: ${finalStatus} for Order: ${orderId}`);

    // 4. Fetch Course & Addon Details from Enrollments
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
      console.error("⚠️ Error fetching enrollment details:", enrollmentError);
    }

    // Format the data for the columns
    const mainBatchName = enrollmentData?.courses?.title || "Unknown Batch";
    
    // Handle subject_name safely (it can be string, array, or null)
    let addonsNames = "None";
    if (enrollmentData?.subject_name) {
      if (Array.isArray(enrollmentData.subject_name)) {
        addonsNames = enrollmentData.subject_name.join(", ");
      } else {
        addonsNames = String(enrollmentData.subject_name);
      }
    }

    // 5. Insert into 'payments' table
    const paymentRecord = {
      order_id: orderId,
      payment_id: paymentData.cf_order_id || null, // If null, the SQL update 'DROP NOT NULL' will save us
      user_id: userId || null,
      amount: paymentData.order_amount,
      status: finalStatus,
      payment_mode: paymentData.payment_session_id ? "session" : "unknown",
      raw_response: paymentData,
      batch: mainBatchName,
      courses: addonsNames
    };

    console.log("Attempting to insert payment record:", JSON.stringify(paymentRecord));

    const { error: insertError } = await supabase
      .from("payments")
      .insert(paymentRecord);

    if (insertError) {
      // Log the EXACT error from the database (e.g. "Relation does not exist" or "RLS violation")
      console.error("❌ DATABASE ERROR: Failed to insert payment:", insertError);
      console.error("Error Code:", insertError.code, "Message:", insertError.message);
    } else {
      console.log("✅ Payment record successfully saved.");
    }

    // 6. Update Enrollments Status
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: finalStatus,
        payment_id: paymentData.cf_order_id,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("❌ Error updating enrollment status:", updateError);
    }

    // 7. Redirect User
    const redirectUrl = finalStatus === "success"
      ? `${frontendUrl}/dashboard?payment=success`
      : `${frontendUrl}/dashboard?payment=failed`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });

  } catch (error: any) {
    console.error("❌ UNHANDLED EXCEPTION:", error.message, error.stack);
    return new Response(null, {
      status: 302,
      headers: { Location: `${frontendUrl}/dashboard?payment=error&message=unknown_error` },
    });
  }
});
