
CREATE TABLE public.google_group_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sync_queue_status ON public.google_group_sync_queue(status) WHERE status = 'pending';

ALTER TABLE public.google_group_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.google_group_sync_queue FOR ALL USING (true) WITH CHECK (true);
