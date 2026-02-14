import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GROUP_EMAIL = "alldatastudents@unknowniitians.com";
const BATCH_SIZE = 50; // Process 50 at a time
const DELAY_BETWEEN_CALLS_MS = 200; // 200ms between each API call (~5/sec, well under 60/min)
const DELAY_BETWEEN_BATCHES_MS = 2000; // 2s pause between batches

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

async function addMemberToGroup(accessToken: string, memberEmail: string): Promise<{ email: string; status: string }> {
  const url = `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(GOOGLE_GROUP_EMAIL)}/members`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail, role: "MEMBER" }),
    });
    await response.json();
    if (response.ok) return { email: memberEmail, status: "added" };
    if (response.status === 409) return { email: memberEmail, status: "already_member" };
    if (response.status === 429) return { email: memberEmail, status: "rate_limited" };
    return { email: memberEmail, status: "failed" };
  } catch {
    return { email: memberEmail, status: "error" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
    const PRIVATE_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!;
    const ADMIN_EMAIL = Deno.env.get("GOOGLE_ADMIN_EMAIL")!;

    // Accept optional offset param to resume from a specific point
    let startOffset = 0;
    try {
      const body = await req.json();
      if (body?.offset) startOffset = parseInt(body.offset, 10) || 0;
    } catch { /* no body is fine */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Count total profiles
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("email", "is", null);

    const totalProfiles = count || 0;
    console.log(`Total profiles with email: ${totalProfiles}, starting from offset: ${startOffset}`);

    let accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, ADMIN_EMAIL);
    let tokenFetchedAt = Date.now();

    const results = { added: 0, already_member: 0, failed: 0, rate_limited: 0, error: 0, processed: 0 };
    let currentOffset = startOffset;

    // Process in paginated batches of BATCH_SIZE
    while (currentOffset < totalProfiles) {
      // Refresh token every 45 minutes
      if (Date.now() - tokenFetchedAt > 45 * 60 * 1000) {
        console.log("Refreshing access token...");
        accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, ADMIN_EMAIL);
        tokenFetchedAt = Date.now();
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("email")
        .not("email", "is", null)
        .order("created_at", { ascending: true })
        .range(currentOffset, currentOffset + BATCH_SIZE - 1);

      if (error) {
        console.error(`Fetch error at offset ${currentOffset}:`, error.message);
        break;
      }

      if (!profiles || profiles.length === 0) break;

      console.log(`Processing batch: offset ${currentOffset}, size ${profiles.length}`);

      for (const profile of profiles) {
        if (!profile.email) continue;

        const result = await addMemberToGroup(accessToken, profile.email);
        results[result.status as keyof typeof results] = ((results[result.status as keyof typeof results] as number) || 0) + 1;
        results.processed++;

        // If rate limited, wait longer then retry once
        if (result.status === "rate_limited") {
          console.log(`Rate limited at ${profile.email}, waiting 10s...`);
          await new Promise((r) => setTimeout(r, 10000));
          const retry = await addMemberToGroup(accessToken, profile.email);
          if (retry.status !== "rate_limited") {
            results.rate_limited--;
            results[retry.status as keyof typeof results] = ((results[retry.status as keyof typeof results] as number) || 0) + 1;
          }
        }

        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
      }

      currentOffset += profiles.length;
      console.log(`Progress: ${currentOffset}/${totalProfiles} | Added: ${results.added} | Already: ${results.already_member} | Failed: ${results.failed}`);

      // Pause between batches
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
    }

    console.log("BULK SYNC COMPLETE:", JSON.stringify(results));

    return new Response(JSON.stringify({ total: totalProfiles, ...results }), {
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
