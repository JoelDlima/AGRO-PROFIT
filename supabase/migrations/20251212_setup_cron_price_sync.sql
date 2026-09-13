-- Set up pg_cron to automatically sync prices every 12 hours
-- This runs the Edge Function that updates price_history table

-- Enable pg_cron extension (run once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the sync to run every 12 hours
-- Runs at 6 AM and 6 PM IST (12:30 AM and 12:30 PM UTC)
SELECT cron.schedule(
  'sync-mandi-prices',
  '30 0,12 * * *',  -- At 00:30 and 12:30 UTC (6 AM and 6 PM IST)
  $$
  SELECT
    net.http_post(
      url := 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
    ) as request_id;
  $$
);

-- Alternative: Use Supabase's built-in pg_net for HTTP calls
-- This version is simpler and doesn't require pg_cron extension
-- You can also trigger this from Supabase Dashboard → Database → Cron Jobs

-- View scheduled jobs
SELECT * FROM cron.job;

-- To manually trigger the sync (for testing):
-- SELECT net.http_post(
--   url := 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
-- );

-- To unschedule (if needed):
-- SELECT cron.unschedule('sync-mandi-prices');
