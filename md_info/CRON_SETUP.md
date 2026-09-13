# Automated Price Sync Setup

This guide explains how to set up automatic price syncing every 12 hours using Supabase Edge Functions.

## Overview

The system automatically fetches prices for all 34 crops every 12 hours and stores them in:
- `mandi_prices_cache` - Latest prices (100 markets per crop)
- `price_history` - Historical data for trends (50 markets per crop per day)

## Setup Steps

### 1. Deploy the Edge Function

```bash
cd agro-profit-pro
npx supabase functions deploy sync-prices-cron
```

### 2. Set Up Automatic Scheduling

#### Option A: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/oxqkzzglonsganfcouob/database/cron-jobs
2. Click "Create a new cron job"
3. Configure:
   - **Name**: sync-mandi-prices
   - **Schedule**: `30 0,12 * * *` (Runs at 12:30 AM and 12:30 PM UTC = 6 AM and 6 PM IST)
   - **SQL Command**:
   ```sql
   SELECT
     net.http_post(
       url := 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
       )
     ) as request_id;
   ```
4. Click "Create cron job"

#### Option B: SQL Editor

Run the migration file:
1. Open https://supabase.com/dashboard/project/oxqkzzglonsganfcouob/sql/new
2. Paste contents of `supabase/migrations/20251212_setup_cron_price_sync.sql`
3. Click "Run"

### 3. Manual Testing

To trigger the sync manually (for testing):

```bash
curl -X POST 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

Or run in Supabase SQL Editor:
```sql
SELECT net.http_post(
  url := 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
);
```

### 4. Monitor Cron Jobs

View all scheduled jobs:
```sql
SELECT * FROM cron.job;
```

View job execution history:
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## How It Works

1. **Cron Trigger**: pg_cron runs at 12:30 AM and 12:30 PM UTC (6 AM and 6 PM IST)
2. **Edge Function**: `sync-prices-cron` is called
3. **Data Fetch**: Loops through all 34 crops, calls `fetch-mandi-prices` for each
4. **Storage**:
   - Upserts into `mandi_prices_cache` (keeps latest 7 days)
   - Upserts into `price_history` (keeps latest 15 days, one entry per day)
5. **Cleanup**: Old data is automatically removed

## Benefits

- ✅ **No App Launch Required**: Runs in background on server
- ✅ **Builds Historical Data**: Accumulates 7-15 days of price trends
- ✅ **Real Graphs**: Price Trends page shows actual data with dates
- ✅ **AI Context**: Gemini AI can access cached prices instantly
- ✅ **Better UX**: Users don't wait for slow API calls

## Troubleshooting

### Check if cron is running:
```sql
SELECT * FROM cron.job WHERE jobname = 'sync-mandi-prices';
```

### Check recent executions:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-mandi-prices')
ORDER BY start_time DESC;
```

### Unschedule if needed:
```sql
SELECT cron.unschedule('sync-mandi-prices');
```

### Re-schedule:
Run the migration SQL again.

## Data Retention

- **mandi_prices_cache**: 7 days (100 markets per crop)
- **price_history**: 15 days (50 markets per crop per day)
- Old data is automatically cleaned up by the sync function

## Rate Limiting

- 1 second delay between crops (34 seconds total per sync)
- Prevents API throttling from government Mandi API
- Each sync takes ~2-3 minutes total
