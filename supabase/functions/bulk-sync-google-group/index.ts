import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GROUP_EMAIL = "alldatastudents@unknowniitians.com";
const BATCH_SIZE = 400; // Process 400 per run (safe under 150s timeout with 200ms delay)
const DELAY_BETWEEN_CALLS_MS = 200;

function base64url(input: Uint8Array): string {
  let str = "";
  for (const byte of input) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeString(str: string): string {
  return base64url(new TextEncoder().encode(str));
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey("pkcs8", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function createSignedJWT(serviceAccountEmail: string, privateKey: string, adminEmail: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccountEmail,
    sub: adminEmail,
    scope: "https://www.googleapis.com/auth/admin.directory.group.member",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const encodedHeader = base64urlEncodeString(JSON.stringify(header));
  const encodedPayload = base64urlEncodeString(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function getAccessToken(serviceAccountEmail: string, privateKey: string, adminEmail: string): Promise<string> {
  const jwt = await createSignedJWT(serviceAccountEmail, privateKey, adminEmail);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Token exchange failed: ${data.error_description || data.error}`);
  return data.access_token;
}

async function addMemberToGroup(accessToken: string, memberEmail: string): Promise<{ email: string; status: string; error?: string }> {
  const url = `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(GOOGLE_GROUP_EMAIL)}/members`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail, role: "MEMBER" }),
    });
    const body = await response.json();
    if (response.ok) return { email: memberEmail, status: "added" };
    if (response.status === 409) return { email: memberEmail, status: "already_member" };
    if (response.status === 429) return { email: memberEmail, status: "rate_limited" };
    return { email: memberEmail, status: "failed", error: body?.error?.message || `HTTP ${response.status}` };
  } catch (err) {
    return { email: memberEmail, status: "failed", error: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
    const PRIVATE_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!;
    const ADMIN_EMAIL = Deno.env.get("GOOGLE_ADMIN_EMAIL")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch pending emails from the queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("google_group_sync_queue")
      .select("id, email")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw new Error(`Failed to fetch queue: ${fetchError.message}`);

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("No pending emails in queue. All done!");
      return new Response(JSON.stringify({ message: "No pending emails", processed: 0, remaining: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count remaining
    const { count: totalPending } = await supabase
      .from("google_group_sync_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    console.log(`Processing ${pendingEmails.length} emails. Total pending: ${totalPending}`);

    const accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, ADMIN_EMAIL);
    const results = { added: 0, already_member: 0, failed: 0, rate_limited: 0 };

    for (const item of pendingEmails) {
      const trimmedEmail = item.email.trim();
      if (!trimmedEmail) {
        await supabase
          .from("google_group_sync_queue")
          .update({ status: "failed", error_message: "Empty email", processed_at: new Date().toISOString() })
          .eq("id", item.id);
        results.failed++;
        continue;
      }

      let result = await addMemberToGroup(accessToken, trimmedEmail);

      // If rate limited, wait 10s and retry once
      if (result.status === "rate_limited") {
        console.log(`Rate limited at ${trimmedEmail}, waiting 10s...`);
        await new Promise((r) => setTimeout(r, 10000));
        result = await addMemberToGroup(accessToken, trimmedEmail);
      }

      // Update queue row
      await supabase
        .from("google_group_sync_queue")
        .update({
          status: result.status,
          error_message: result.error || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      results[result.status as keyof typeof results] = (results[result.status as keyof typeof results] || 0) + 1;

      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
    }

    const remaining = (totalPending || 0) - pendingEmails.length;
    console.log(`Batch complete. Added: ${results.added} | Already: ${results.already_member} | Failed: ${results.failed} | Remaining: ${remaining}`);

    return new Response(JSON.stringify({ processed: pendingEmails.length, remaining, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bulk sync error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
