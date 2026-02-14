

# Auto-Add New Users to Google Group "alldatastudents"

## What This Does
Every time a new user signs up and their email is saved in the `profiles` table, they will be automatically added to a Google Group called `alldatastudents@yourdomain.com`.

---

## Architecture

```text
User Signs Up
    |
    v
Supabase creates profile (handle_new_user trigger)
    |
    v
Database Webhook Trigger (on INSERT to profiles)
    |
    v
Supabase Edge Function: "add-to-google-group"
    |
    v
Google Admin SDK (Directory API)
    |
    v
User added to alldatastudents@yourdomain.com
```

---

## Step-by-Step Setup

### STEP 1: Create the Google Group

1. Go to [Google Admin Console](https://admin.google.com)
2. Navigate to **Directory > Groups**
3. Click **Create group**
4. Set:
   - Name: `All Data Students`
   - Group email: `alldatastudents@yourdomain.com`
   - Access type: Set to **Restricted** or your preference
   - Who can join: **Only invited users** (since the system will add them)
5. Click **Create**

---

### STEP 2: Create a Google Cloud Service Account

This is needed so your edge function can call Google APIs on behalf of your domain.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project (can use the same one as your Google Sign-In)
3. Go to **APIs & Services > Enabled APIs**
4. Search for and enable: **Admin SDK API**
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > Service Account**
   - Name: `supabase-group-manager`
   - Click **Create and Continue**
   - Role: skip (not needed here)
   - Click **Done**
7. Click on the newly created service account
8. Go to the **Keys** tab
9. Click **Add Key > Create New Key > JSON**
10. **Download the JSON file** -- you will need these values:
    - `client_email` (e.g., `supabase-group-manager@yourproject.iam.gserviceaccount.com`)
    - `private_key` (the RSA private key string)

---

### STEP 3: Enable Domain-Wide Delegation

This allows the service account to act as an admin user in your Google Workspace.

1. In Google Cloud Console, go to the service account you created
2. Click **Edit** (pencil icon)
3. Expand **Show domain-wide delegation**
4. Check **Enable Google Workspace Domain-Wide Delegation**
5. Save
6. Copy the **Client ID** (numeric, e.g., `1234567890123456`)

Now authorize it in Google Admin:

7. Go to [Google Admin Console](https://admin.google.com)
8. Navigate to **Security > Access and Data Control > API Controls**
9. Click **Manage Domain Wide Delegation**
10. Click **Add new**
11. Enter:
    - **Client ID**: The numeric ID from step 6
    - **OAuth Scopes**: `https://www.googleapis.com/auth/admin.directory.group.member`
12. Click **Authorize**

---

### STEP 4: Add Secrets to Supabase

You need to add 3 secrets to your Supabase project. Go to your **Supabase Dashboard > Project Settings > Edge Functions > Secrets** and add:

| Secret Name | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The `client_email` from the JSON key file |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | The `private_key` from the JSON key file (the full string including `-----BEGIN PRIVATE KEY-----`) |
| `GOOGLE_ADMIN_EMAIL` | An admin email in your domain (e.g., `admin@yourdomain.com`) -- the service account will impersonate this user |

---

### STEP 5: Create the Edge Function

I will create a new Supabase Edge Function at `supabase/functions/add-to-google-group/index.ts` that:

1. Receives a webhook payload with the new user's email
2. Creates a JWT signed with the service account's private key
3. Exchanges it for a Google access token (impersonating the admin)
4. Calls the Google Admin Directory API to add the member to the group
5. Returns success/failure

---

### STEP 6: Create a Database Webhook

After the edge function is deployed, set up a database webhook in Supabase:

1. Go to **Supabase Dashboard > Database > Webhooks**
2. Click **Create a new hook**
3. Configure:
   - Name: `add_new_user_to_google_group`
   - Table: `profiles`
   - Events: **INSERT**
   - Type: **Supabase Edge Function**
   - Edge Function: `add-to-google-group`
4. Save

---

## What I Need From You Before Building

1. **Your Google Workspace domain** (e.g., `yourdomain.com`) -- so I can set the group email in the code
2. **Confirmation that you have completed Steps 1-4** (created the group, service account, delegation, and added the 3 secrets)

Once you confirm, I will build the edge function (Step 5) and you will set up the webhook (Step 6) from the Supabase dashboard.

---

## Summary Checklist

- [ ] Step 1: Create Google Group `alldatastudents@yourdomain.com`
- [ ] Step 2: Create Service Account + download JSON key
- [ ] Step 3: Enable domain-wide delegation + authorize scopes in Admin Console
- [ ] Step 4: Add 3 secrets to Supabase (service account email, private key, admin email)
- [ ] Step 5: I build the edge function (after your confirmation)
- [ ] Step 6: You create the database webhook in Supabase dashboard

