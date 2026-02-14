

# Plan: Bulk Add 2,971 Emails from TXT File + Auto Cron Job

## What will happen

1. **Store emails in a new database table** (`google_group_sync_queue`) so the edge function can process them in chunks across multiple runs without needing file access.

2. **Update the bulk-sync edge function** to read from this queue table instead of `profiles`, process emails in batches (~500 per run within the ~150s timeout), and mark each as "done" or "failed" after processing.

3. **Set up a pg_cron job** that automatically calls the edge function every 5 minutes. It will keep running until all emails are processed, then the cron job can be removed or left idle (it will find 0 pending emails and exit quickly).

4. **One-time migration** to insert all 2,971 emails from the uploaded file into the queue table.

## How it works

- Each cron run processes ~400-500 emails (200ms delay each = ~80-100s of work, safely under 150s timeout)
- Emails already in the Google Group get a `409` response and are marked as done (no duplicates)
- After ~6-7 automatic runs (~30-35 minutes total), all 2,971 emails will be added
- No manual intervention needed -- just approve and let it run

## Technical Details

### Step 1: Create `google_group_sync_queue` table

```sql
CREATE TABLE public.google_group_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending, added, already_member, failed
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for fast pending lookups
CREATE INDEX idx_sync_queue_status ON public.google_group_sync_queue(status) WHERE status = 'pending';

-- RLS: only service role needs access
ALTER TABLE public.google_group_sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.google_group_sync_queue FOR ALL USING (true) WITH CHECK (true);
```

### Step 2: Insert all 2,971 emails from the TXT file

A migration will bulk-insert all the emails into the queue table using `INSERT INTO ... VALUES (...)`.

### Step 3: Update `bulk-sync-google-group` edge function

- Read from `google_group_sync_queue` WHERE `status = 'pending'` LIMIT 400
- Process each email with 200ms delay
- Update each row's `status` to `added`, `already_member`, or `failed`
- Return summary of how many were processed and how many remain

### Step 4: Set up pg_cron job

```sql
SELECT cron.schedule(
  'bulk-google-group-sync',
  '*/5 * * * *',  -- every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://qzrvctpwefhmcduariuw.supabase.co/functions/v1/bulk-sync-google-group',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <anon_key>"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

The cron job will auto-stop being useful once all emails are processed (function returns 0 pending). You can then unschedule it or leave it -- it will just do a quick check and exit.

### Summary

| Item | Detail |
|------|--------|
| Total emails | 2,971 |
| Emails per run | ~400-500 |
| Run interval | Every 5 minutes |
| Estimated completion | ~30-35 minutes |
| Manual work needed | None after approval |

