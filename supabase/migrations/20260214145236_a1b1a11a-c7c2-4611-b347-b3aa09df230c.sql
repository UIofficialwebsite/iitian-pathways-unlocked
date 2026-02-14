
-- Normalize emails + dedupe + enforce uniqueness
ALTER TABLE public.google_group_sync_queue
ADD COLUMN IF NOT EXISTS email_normalized text;

UPDATE public.google_group_sync_queue
SET email_normalized = lower(trim(email))
WHERE email_normalized IS NULL;

-- Remove blank/invalid empty emails
DELETE FROM public.google_group_sync_queue
WHERE email_normalized IS NULL OR email_normalized = '';

-- Remove duplicates (keep the earliest created row)
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY email_normalized ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
  FROM public.google_group_sync_queue
)
DELETE FROM public.google_group_sync_queue q
USING ranked r
WHERE q.id = r.id
  AND r.rn > 1;

ALTER TABLE public.google_group_sync_queue
ALTER COLUMN email_normalized SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_google_group_sync_queue_email_normalized
ON public.google_group_sync_queue (email_normalized);

-- Ensure pending index still exists
CREATE INDEX IF NOT EXISTS idx_sync_queue_status_pending
ON public.google_group_sync_queue(status)
WHERE status = 'pending';

-- Enable pg_cron (pg_net already exists because net.http_post is used elsewhere)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cron job to call the edge function every 5 minutes using service role key from DB settings
SELECT cron.schedule(
  'bulk-google-group-sync',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://qzrvctpwefhmcduariuw.supabase.co/functions/v1/bulk-sync-google-group',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
