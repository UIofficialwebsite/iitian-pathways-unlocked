
-- Schedule hourly bulk sync cron job
SELECT cron.schedule(
  'bulk-google-group-sync',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qzrvctpwefhmcduariuw.supabase.co/functions/v1/bulk-sync-google-group',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cnZjdHB3ZWZobWNkdWFyaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTAxNDYsImV4cCI6MjA2MjA4NjE0Nn0.VK1JfGf1zhXbiOc_1N03HQnA0xlpGoynjXRkb_k2NJ0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
