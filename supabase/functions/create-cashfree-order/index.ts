import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const envKey = Deno.env.get("CASHFREE_KEY");
    const envSecret = Deno.env.get("CASHFREE_SECRET");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!envSecret || !envKey) throw new Error("Cashfree keys missing in Supabase Secrets");

    const origin = req.headers.get("origin") || "https://preview.lovable.app";

    const { 
      courseId, 
      selectedSubjects, 
      amount, 
      userId, 
      customerPhone, 
      customerEmail 
    } = await req.json();

    const orderId = `order_${Date.now()}_${userId}`;
    const verifyUrl = `${supabaseUrl}/functions/v1/verify-cashfree-payment?order_id=${orderId}&redirect_url=${encodeURIComponent(origin)}`;

    // Initialize Supabase client early to fetch user and course data
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's name from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, student_name')
      .eq('id', userId)
      .single();

    const customerName = profile?.full_name || profile?.student_name || "Customer";

    // Fetch course details (title + mandatory subjects)
    const { data: course } = await supabase
      .from('courses')
      .select('title, subject')
      .eq('id', courseId)
      .single();

    const batchName = course?.title || "Unknown Batch";

    // Parse mandatory subjects (comma-separated in courses.subject)
    const mandatorySubjects: string[] = course?.subject
      ? course.subject.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Get addon names from course_addons
    let addonNames: string[] = [];
    if (selectedSubjects && selectedSubjects.length > 0) {
      const { data: addons } = await supabase
        .from('course_addons')
        .select('subject_name')
        .in('id', selectedSubjects);
      
      addonNames = addons?.map(a => a.subject_name).filter(Boolean) || [];
    }

    // Combine mandatory + addon subjects (unique values)
    const allSubjects = [...new Set([...mandatorySubjects, ...addonNames])];
    const coursesString = allSubjects.length > 0 ? allSubjects.join(", ") : "No subjects";

    // 1. Create Order with Cashfree
    const cashfreeResponse = await fetch(
      cashfreeEnv === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": envKey,
          "x-client-secret": envSecret,
          "x-api-version": "2023-08-01",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: amount,
          order_currency: "INR",
          customer_details: {
            customer_id: userId,
            customer_name: customerName,
            customer_phone: customerPhone || "9999999999",
            customer_email: customerEmail || "test@example.com",
          },
          order_meta: {
            return_url: verifyUrl,
          },
          order_note: batchName,
          order_tags: {
            batch: batchName,
            courses: coursesString,
            user_id: userId
          },
        }),
      }
    );

    if (!cashfreeResponse.ok) {
      const errText = await cashfreeResponse.text();
      throw new Error(`Cashfree API Error: ${errText}`);
    }

    const orderData = await cashfreeResponse.json();


    // 2. Database Logic - Supabase client already initialized above

    // A. Fetch Add-on details
    let addonsData: any[] = [];
    if (selectedSubjects && selectedSubjects.length > 0) {
      const { data: addons, error: addonsError } = await supabase
        .from('course_addons')
        .select('id, subject_name, price')
        .in('id', selectedSubjects);

      if (addonsError) throw new Error(`Failed to fetch addons: ${addonsError.message}`);
      addonsData = addons || [];
    }

    // B. Check if a "Main Course" row already exists for this user/course
    const { data: existingMainEnrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('id, amount')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .is('subject_name', null) // subject_name IS NULL identifies the main batch row
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing enrollment:", fetchError);
    }

    const enrollmentRows = [];

    // C. Handle Main Course Logic
    if (existingMainEnrollment) {
      // UPDATE EXISTING: Sum up the price
      const currentTotal = Number(existingMainEnrollment.amount) || 0;
      const newTransactionAmount = Number(amount) || 0;
      
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ 
          amount: currentTotal + newTransactionAmount,
          // We DO NOT update status here to avoid blocking access if it was already 'success'
        })
        .eq('id', existingMainEnrollment.id);

      if (updateError) throw new Error(`Failed to update existing course price: ${updateError.message}`);
      
    } else {
      // CREATE NEW: User's first time buying this batch
      enrollmentRows.push({
        user_id: userId,
        course_id: courseId,
        order_id: orderId,
        status: 'pending',
        amount: amount, // Initial total
        subject_name: null,
        payment_id: null
      });
    }

    // D. Handle Add-ons (Always insert new rows for specific subject tracking)
    addonsData.forEach((addon) => {
      enrollmentRows.push({
        user_id: userId,
        course_id: courseId,
        order_id: orderId,
        status: 'pending',
        amount: addon.price, // Individual subject price
        subject_name: addon.subject_name,
        payment_id: null
      });
    });

    // E. Perform Bulk Insert (Only if we have new rows to add)
    if (enrollmentRows.length > 0) {
      const { error: dbError } = await supabase
        .from('enrollments')
        .insert(enrollmentRows);

      if (dbError) throw new Error(`DB Error: ${dbError.message}`);
    }

    return new Response(JSON.stringify({ 
      ...orderData, 
      environment: cashfreeEnv,
      verifyUrl: verifyUrl 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("FULL ERROR DETAILS:", error);
    return new Response(JSON.stringify({ 
      error: error.message, 
      details: error.stack 
    }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
