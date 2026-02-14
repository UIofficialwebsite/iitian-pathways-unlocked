import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GROUP_EMAIL = "alldatastudents@unknowniitians.com";

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
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: memberEmail, role: "MEMBER" }),
  });
  await response.json();
  if (response.ok) return { email: memberEmail, status: "added" };
  if (response.status === 409) return { email: memberEmail, status: "already_member" };
  return { email: memberEmail, status: "failed" };
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

    // Fetch all profiles with emails
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);

    const emails = profiles?.map((p) => p.email).filter(Boolean) || [];
    console.log(`Found ${emails.length} emails to sync`);

    const accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, ADMIN_EMAIL);

    const results = { added: 0, already_member: 0, failed: 0, errors: [] as string[] };

    for (const email of emails) {
      try {
        const result = await addMemberToGroup(accessToken, email!);
        results[result.status as keyof typeof results] = (results[result.status as keyof typeof results] as number) + 1;
        if (result.status === "failed") results.errors.push(email!);
      } catch (e) {
        results.failed++;
        results.errors.push(email!);
      }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log("Bulk sync results:", JSON.stringify(results));

    return new Response(JSON.stringify({ total: emails.length, ...results }), {
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
