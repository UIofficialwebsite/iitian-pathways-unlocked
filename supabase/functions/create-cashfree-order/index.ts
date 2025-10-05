import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- IMPORTANT: SET THESE IN YOUR SUPABASE EDGE FUNCTION SECRETS ---
// To get your keys, go to your Cashfree Dashboard -> Developers -> API Keys
const cashfreeKey = Deno.env.get("CASHFREE_KEY"); // This is your 'Client ID'
const cashfreeSecret = Deno.env.get("CASHFREE_SECRET"); // This is your 'Client Secret'

// Set this to 'production' in your secrets when you are ready to go live.
// If it's anything else (or not set), it will use the sandbox URL.
const cashfreeEnv = Deno.env.get("CASHFREE_ENVIRONMENT") ?? "sandbox";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  courseId: string;
  amount: number;
  userId: string;
  customerPhone: string; // Ensure this is a 10-digit string like "9999999999"
  customerEmail: string; // Add customer email
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check for valid credentials
    if (!cashfreeKey || !cashfreeSecret) {
      console.error("Cashfree API Key or Secret is not configured in environment variables.");
      throw new Error("Payment provider credentials are not configured.");
    }

    const { courseId, amount, userId, customerPhone, customerEmail }: OrderRequest = await req.json();

    // 2. Determine Cashfree API endpoint based on environment
    const cashfreeApiUrl = cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // 3. Generate a unique order ID for your system
    const orderId = `order_${Date.now()}_${userId}`;

    // 4. Construct the payload for Cashfree
    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      },
      order_meta: {
        // This is where Cashfree will redirect the user after payment
        return_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-cashfree-payment?order_id={order_id}`,
      },
    };

    // --- DEBUGGING: Log the exact data being sent to Cashfree ---
    console.log("Attempting to create Cashfree order with URL:", cashfreeApiUrl);
    console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

    // 5. Make the API call to Cashfree
    const cashfreeResponse = await fetch(cashfreeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cashfreeKey,
        "x-client-secret": cashfreeSecret,
        "x-api-version": "2023-08-01", // Verify this is the latest version in Cashfree docs
      },
      body: JSON.stringify(orderPayload),
    });

    // 6. Handle the response from Cashfree
    if (!cashfreeResponse.ok) {
      // --- THIS IS THE MOST IMPORTANT PART FOR DEBUGGING ---
      // It captures the exact error message from Cashfree's server.
      const errorBody = await cashfreeResponse.text();
      console.error("Cashfree API responded with a non-2xx status:", cashfreeResponse.status);
      console.error("Cashfree API Error Body:", errorBody);
      throw new Error(`Failed to create Cashfree order. Server said: ${errorBody}`);
    }

    const orderData = await cashfreeResponse.json();

    // 7. Store the pending order in your database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      amount: amount,
      order_id: orderId,
      status: "pending", // Mark status as pending until verification
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error("Failed to save order to the database.");
    }

    // 8. Send the successful response back to your frontend
    return new Response(JSON.stringify(orderData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in create-cashfree-order function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
