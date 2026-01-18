import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
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

    // 2. Verify Status with Cashfree
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const cashfreeApiUrl = cashfreeEnv === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";

    const verifyResp = await fetch(`${cashfreeApiUrl}/${orderId}`, {
      headers: {
        "x-client-id": cashfreeKey,
        "x-client-secret": cashfreeSecret,
        "x-api-version": "2023-08-01"
      }
    });

    if (!verifyResp.ok) {
      console.error("❌ Cashfree Verification Failed:", verifyResp.status);
      return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
    }

    const paymentData = await verifyResp.json();
    const finalStatus = paymentData.order_status === "PAID" ? "success" : "failed";
    const userId = paymentData.customer_details?.customer_id;

    // 3. Fetch Details Safe for Multiple Rows (The Fix)
    // We use .select() instead of .maybeSingle() to prevent crashing on 2+ rows
    const { data: enrollments, error: fetchError } = await supabase
      .from("enrollments")
      .select(`
        subject_name,
        courses ( title )
      `)
      .eq("order_id", orderId);

    if (fetchError) console.error("⚠️ Enrollment Fetch Error:", fetchError);

    // 4. Process Data safely
    let mainBatchName = "Unknown Batch";
    let allAddons: string[] = [];

    if (enrollments && enrollments.length > 0) {
      // Logic: The first row usually contains the main course link
      // If you have multiple rows, they usually link to the same course or split logic
      mainBatchName = enrollments[0]?.courses?.title || "Unknown Batch";

      // Collect all subject/addon names from all rows
      enrollments.forEach(row => {
        if (row.subject_name) {
          if (Array.isArray(row.subject_name)) {
            allAddons.push(...row.subject_name);
          } else {
            // Split by comma if it's a string like "Maths, Physics"
            const parts = String(row.subject_name).split(',');
            allAddons.push(...parts.map(s => s.trim()));
          }
        }
      });
    }

    // Deduplicate and join
    const coursesString = allAddons.length > 0 ? [...new Set(allAddons)].join(", ") : "None";

    // 5. Insert Payment Record
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        payment_id: paymentData.cf_order_id || null,
        user_id: userId || null,
        amount: paymentData.order_amount,
        status: finalStatus,
        payment_mode: paymentData.payment_session_id ? "session" : "unknown",
        raw_response: paymentData,
        batch: mainBatchName,  // Saved to 'batch' column
        courses: coursesString // Saved to 'courses' column
      });

    if (insertError) {
      // Logs the specific reason if it still fails (e.g., RLS)
      console.error("❌ DB INSERT ERROR:", insertError.message);
    } else {
      console.log(`✅ Payment Saved: Batch=[${mainBatchName}], Courses=[${coursesString}]`);
    }

    // 6. Update Enrollment Status
    await supabase.from("enrollments")
      .update({ status: finalStatus, payment_id: paymentData.cf_order_id })
      .eq("order_id", orderId);

    // 7. Redirect
    const redirectUrl = `${frontendUrl}/dashboard?payment=${finalStatus}`;
    return new Response(null, { status: 302, headers: { Location: redirectUrl } });

  } catch (err: any) {
    console.error("❌ Unhandled Error:", err.message);
    return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
  }
});
