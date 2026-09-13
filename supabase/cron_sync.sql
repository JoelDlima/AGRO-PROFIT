-- ====================================================================
-- SUPABASE 3-HOUR MANDI PRICE SYNC CRON JOB
-- Automatically calls the Vercel cron sync endpoint every 3 hours
-- to refresh mandi prices and price history in Supabase.
-- ====================================================================

-- 1. Enable required extensions (pg_cron and pg_net)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Remove any previously scheduled sync job to avoid duplicates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-mandi-prices-3h') THEN
    PERFORM cron.unschedule('sync-mandi-prices-3h');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-mandi-prices') THEN
    PERFORM cron.unschedule('sync-mandi-prices');
  END IF;
END $$;

-- 3. Schedule the 3-hour sync job
-- Runs every 3 hours at minute 0: (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 UTC)
SELECT cron.schedule(
  'sync-mandi-prices-3h',
  '0 */3 * * *',
  $$
  SELECT net.http_get(
    url := 'https://your-production-domain.vercel.app/api/sync'
  ) AS request_id;
  $$
);

-- 4. Verify scheduled jobs
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'sync-mandi-prices-3h';

-- 5. Optional manual test: Run this in SQL Editor to immediately trigger a sync
-- SELECT net.http_get(url := 'https://agro-profit-pro.vercel.app/api/sync');
