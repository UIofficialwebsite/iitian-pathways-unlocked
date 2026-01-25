import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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
        courses ( title, subject )
      `)
      .eq("order_id", orderId);

    if (fetchError) console.error("⚠️ Enrollment Fetch Error:", fetchError);

    // 7. Process Course and Addon Names + Mandatory Subjects
    let mainBatchName = "Unknown Batch";
    let mandatorySubjects: string[] = [];
    let addonSubjectNames: string[] = [];

    if (enrollments && enrollments.length > 0) {
      // Get the first enrollment's course data - handle Supabase join type
      const firstEnrollment = enrollments[0];
      const courseData = firstEnrollment?.courses as unknown as { title?: string; subject?: string } | null;
      
      // Extract batch name from course title
      mainBatchName = courseData?.title || "Unknown Batch";
      
      // Extract mandatory subjects from course.subject column (comma-separated)
      if (courseData?.subject) {
        mandatorySubjects = courseData.subject
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      // Collect all subject_name values from enrollments (these could be addon names or IDs)
      addonSubjectNames = enrollments
        .map(e => e.subject_name)
        .filter(Boolean) as string[];
    }

    // Resolve addon names if they are UUIDs
    let resolvedAddonNames: string[] = [];
    if (addonSubjectNames.length > 0) {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const addonIds = addonSubjectNames.filter(s => uuidPattern.test(s));
      
      if (addonIds.length > 0) {
        // Fetch addon names from course_addons table
        const { data: addons } = await supabase
          .from("course_addons")
          .select("id, subject_name")
          .in("id", addonIds);

        const addonMap = new Map(addons?.map(a => [a.id, a.subject_name]) || []);
        
        // Map IDs to names, keep original if not found
        resolvedAddonNames = addonSubjectNames.map(s => addonMap.get(s) || s);
      } else {
        // They're already names
        resolvedAddonNames = addonSubjectNames;
      }
    }

    // Combine mandatory subjects + addon subjects (unique values only)
    const allSubjects = [...mandatorySubjects, ...resolvedAddonNames];
    const uniqueSubjects = [...new Set(allSubjects)].filter(Boolean);
    const coursesString = uniqueSubjects.length > 0 ? uniqueSubjects.join(", ") : "No subjects";

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

    // 9. Extract discount/offer info from Cashfree response
    let discountApplied = false;
    let discountType: string | null = null;
    let discountValue: number | null = null;
    let couponCode: string | null = null;
    let netAmount: number = orderData.order_amount;

    const offers = paymentDetails?.payment_offers || paymentDetails?.offers || [];
    if (offers && offers.length > 0) {
      const appliedOffer = offers[0];
      discountApplied = true;
      discountType = appliedOffer.offer_type || appliedOffer.discount_type || 'flat';
      discountValue = appliedOffer.discount_amount || appliedOffer.cashback_amount || appliedOffer.offer_amount || 0;
      couponCode = appliedOffer.offer_id || appliedOffer.promo_code || appliedOffer.offer_code || null;
      netAmount = paymentDetails?.payment_amount || orderData.order_amount;
      console.log("🎫 Offer Applied:", JSON.stringify(appliedOffer));
    }

    if (!discountApplied && orderData.order_splits) {
      const discountSplit = orderData.order_splits.find((s: any) => s.split_type === 'discount');
      if (discountSplit) {
        discountApplied = true;
        discountType = 'flat';
        discountValue = discountSplit.amount || 0;
        netAmount = orderData.order_amount - (discountValue || 0);
      }
    }

    if (!discountApplied && paymentDetails?.payment_amount && paymentDetails.payment_amount < orderData.order_amount) {
      discountApplied = true;
      discountType = 'flat';
      discountValue = orderData.order_amount - paymentDetails.payment_amount;
      netAmount = paymentDetails.payment_amount;
      console.log("💰 Discount detected from amount difference:", discountValue);
    }

    if (!discountApplied) {
      netAmount = orderData.order_amount;
    }

    // 10. Insert Payment Record with ALL data including Cashfree discount info
    if (finalStatus === "success") {
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
        courses: coursesString,
        discount_applied: discountApplied,
        discount_type: discountApplied ? discountType : null,
        discount_value: discountApplied ? discountValue : null,
        coupon_code: couponCode,
        net_amount: netAmount
      };

      console.log("📝 Inserting Payment:", JSON.stringify(paymentInsertData));

      const { error: insertError } = await supabase
        .from("payments")
        .insert(paymentInsertData);

      if (insertError) {
        console.error("❌ DB INSERT ERROR:", insertError.message);
      } else {
        console.log(`✅ Payment Saved: Batch=[${mainBatchName}], Courses=[${coursesString}], UTR=[${utr}]`);

        // --- EMAIL INTEGRATION START ---
        if (resendApiKey && paymentInsertData.customer_email) {
          try {
            console.log("📧 Attempting to send confirmation email to:", paymentInsertData.customer_email);
            const resend = new Resend(resendApiKey);

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #4F46E5;">Welcome to ${mainBatchName}!</h1>
                <p>Hello,</p>
                <p>Congratulations! Your enrollment has been confirmed.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Enrollment Details</h3>
                  <p><strong>Batch:</strong> ${mainBatchName}</p>
                  <p><strong>Subjects Enrolled:</strong> ${coursesString}</p>
                  <p><strong>Amount Paid:</strong> ₹${netAmount}</p>
                  <p><strong>Transaction ID:</strong> ${paymentInsertData.payment_id}</p>
                </div>

                <p>You can access your Student Support Portal and study materials here:</p>
                <p>
                  <a href="https://ssp.unknowniitians.com" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Access Student Portal
                  </a>
                </p>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">
                  Or visit: <a href="https://ssp.unknowniitians.com">ssp.unknowniitians.com</a>
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #888; font-size: 12px;">
                  If you have any questions, please contact our support team.
                </p>
              </div>
            `;

            const { data: emailData, error: emailError } = await resend.emails.send({
              from: 'Acme <onboarding@resend.dev>', // Update this with your verified sender if you have one
              to: [paymentInsertData.customer_email],
              subject: `Enrollment Confirmed: ${mainBatchName}`,
              html: emailHtml,
            });

            if (emailError) {
              console.error("❌ Email Sending Failed:", emailError);
            } else {
              console.log("✅ Email Sent Successfully:", emailData);
            }
          } catch (emailErr) {
            console.error("⚠️ Unexpected error sending email:", emailErr);
          }
        } else {
          console.warn("⚠️ Skipping email: Missing RESEND_API_KEY or Customer Email");
        }
        // --- EMAIL INTEGRATION END ---
      }
    } else {
      console.log(`ℹ️ Skipping payment table insert: Status is ${finalStatus}`);
    }

    // 11. Update Enrollment Status
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

    // 12. Redirect
    const redirectUrl = `${frontendUrl}/dashboard?payment=${finalStatus}`;
    console.log(`🔄 Redirecting to: ${redirectUrl}`);
    return new Response(null, { status: 302, headers: { Location: redirectUrl } });

  } catch (err: any) {
    console.error("❌ Unhandled Error:", err.message);
    return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/dashboard?payment=error` } });
  }
});
