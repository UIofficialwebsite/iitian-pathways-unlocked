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

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const passedRedirectUrl = url.searchParams.get("redirect_url");
  const frontendUrl = passedRedirectUrl ? decodeURIComponent(passedRedirectUrl) : "https://preview.lovable.app";

  try {
    // 1. Validate Secrets & Setup Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const cashfreeKey = Deno.env.get("CASHFREE_KEY");
    const cashfreeSecret = Deno.env.get("CASHFREE_SECRET");

    if (!supabaseUrl || !supabaseKey || !cashfreeKey || !cashfreeSecret) {
      console.error("❌ Critical: Missing API Keys in Secrets");
      return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    if (!orderId) {
      console.error("❌ Missing Order ID");
      return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
    }

    // 2. Get Cashfree API URL based on environment
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const cashfreeApiUrl = cashfreeEnv === "production" 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    const cashfreeHeaders = {
      "x-client-id": cashfreeKey,
      "x-client-secret": cashfreeSecret,
      "x-api-version": "2023-08-01"
    };

    // 3. Fetch Order Status from Cashfree
    const orderResp = await fetch(`${cashfreeApiUrl}/${orderId}`, { headers: cashfreeHeaders });
    if (!orderResp.ok) {
      console.error("❌ Cashfree Order Fetch Failed:", orderResp.status);
      return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
    }
    const orderData = await orderResp.json();
    console.log("📦 Order Data:", JSON.stringify(orderData));

    // 4. Fetch Payment Details from Cashfree (for UTR, payment_mode, payment_time)
    let paymentDetails: any = null;
    try {
      const paymentsResp = await fetch(`${cashfreeApiUrl}/${orderId}/payments`, { headers: cashfreeHeaders });
      if (paymentsResp.ok) {
        const paymentsArray = await paymentsResp.json();
        // Get the successful payment or the latest one
        paymentDetails = paymentsArray?.find((p: any) => p.payment_status === "SUCCESS") || paymentsArray?.[0];
        console.log("💳 Payment Details:", JSON.stringify(paymentDetails));
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch payment details:", err);
    }

    // 5. Determine final status
    const finalStatus = orderData.order_status === "PAID" ? "success" : "failed";
    const userId = orderData.customer_details?.customer_id;

    // 6. Fetch Enrollment Details
    const { data: enrollments, error: fetchError } = await supabase
      .from("enrollments")
      .select(`
        subject_name,
        course_id,
        courses ( title )
      `)
      .eq("order_id", orderId);

    if (fetchError) console.error("⚠️ Enrollment Fetch Error:", fetchError);

    // 7. Process Course and Addon Names
    let mainBatchName = "Unknown Batch";
    let addonNames: string[] = [];

    if (enrollments && enrollments.length > 0) {
      // Get main batch name from the course
      mainBatchName = enrollments[0]?.courses?.title || "Unknown Batch";

      // Collect all subject_name values (these could be addon IDs or names)
      const subjectNames = enrollments
        .map(e => e.subject_name)
        .filter(Boolean);

      if (subjectNames.length > 0) {
        // Check if they are UUIDs (addon IDs) - try to resolve them
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const addonIds = subjectNames.filter(s => uuidPattern.test(s));
        
        if (addonIds.length > 0) {
          // Fetch addon names from course_addons table
          const { data: addons } = await supabase
            .from("course_addons")
            .select("id, subject_name")
            .in("id", addonIds);

          const addonMap = new Map(addons?.map(a => [a.id, a.subject_name]) || []);
          
          // Map IDs to names, keep original if not found
          addonNames = subjectNames.map(s => addonMap.get(s) || s);
        } else {
          // They're already names
          addonNames = subjectNames;
        }
      }
    }

    const coursesString = addonNames.length > 0 ? [...new Set(addonNames)].join(", ") : "None";

    // 8. Extract UTR from payment details
    let utr: string | null = null;
    if (paymentDetails?.payment_method) {
      const pm = paymentDetails.payment_method;
      utr = pm.upi?.utr 
        || pm.netbanking?.bank_reference 
        || pm.card?.bank_reference 
        || paymentDetails.bank_reference 
        || null;
    }

    // 9. Insert Payment Record with ALL data
    const paymentInsertData = {
      order_id: orderId,
      payment_id: paymentDetails?.cf_payment_id?.toString() || orderData.cf_order_id || null,
      user_id: userId || null,
      amount: orderData.order_amount,
      status: finalStatus,
      payment_mode: paymentDetails?.payment_group || paymentDetails?.payment_method?.type || "unknown",
      payment_time: paymentDetails?.payment_time || paymentDetails?.payment_completion_time || null,
      payment_group: paymentDetails?.payment_group || null,
      utr: utr,
      customer_email: orderData.customer_details?.customer_email || null,
      customer_phone: orderData.customer_details?.customer_phone || null,
      raw_response: { order: orderData, payment: paymentDetails },
      batch: mainBatchName,
      courses: coursesString
    };

    console.log("📝 Inserting Payment:", JSON.stringify(paymentInsertData));

    const { error: insertError } = await supabase
      .from("payments")
      .insert(paymentInsertData);

    if (insertError) {
      console.error("❌ DB INSERT ERROR:", insertError.message);
    } else {
      console.log(`✅ Payment Saved: Batch=[${mainBatchName}], Courses=[${coursesString}], UTR=[${utr}]`);
    }

    // 10. Update Enrollment Status
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({ 
        status: finalStatus, 
        payment_id: paymentDetails?.cf_payment_id?.toString() || orderData.cf_order_id 
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("⚠️ Enrollment Update Error:", updateError.message);
    }

    // 11. Redirect
    const redirectUrl = `${frontendUrl}/dashboard?payment=${finalStatus}`;
    console.log(`🔄 Redirecting to: ${redirectUrl}`);
    return new Response(null, { status: 302, headers: { Location: redirectUrl } });

  } catch (err: any) {
    console.error("❌ Unhandled Error:", err.message);
    return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
  }
});
