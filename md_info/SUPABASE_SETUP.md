# Quick Supabase Setup Guide

## Step 1: Fix RLS Policies (REQUIRED - Fixes 403 Errors)

1. Open: https://supabase.com/dashboard/project/oxqkzzglonsganfcouob/sql/new
2. Paste this SQL and click "Run":

```sql
-- Fix RLS policies for background price sync
-- Allow anonymous inserts for price_history and mandi_prices_cache

-- PRICE HISTORY TABLE
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON price_history;

CREATE POLICY "Enable insert for all users" ON price_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON price_history
  FOR UPDATE USING (true) WITH CHECK (true);

-- MANDI PRICES CACHE
DROP POLICY IF EXISTS "Service role can manage mandi prices" ON mandi_prices_cache;

CREATE POLICY "Enable insert for all users" ON mandi_prices_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON mandi_prices_cache
  FOR UPDATE USING (true) WITH CHECK (true);
```

**Why?** This fixes the 403 Forbidden errors you're seeing. The background sync runs without user authentication, so these tables need public insert permissions.

---

## Step 2: Set Up Automatic Price Sync (Optional but Recommended)

This makes prices update automatically every 12 hours without launching the app.

### Option A: Using Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/oxqkzzglonsganfcouob/database/cron-jobs
2. Click "Create a new cron job"
3. Fill in:
   - **Name**: `sync-mandi-prices`
   - **Schedule**: `30 0,12 * * *` 
   - **Command**:
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

### Option B: Deploy Edge Function First (Advanced)

If cron option doesn't work, you need to deploy the Edge Function:

```bash
cd agro-profit-pro
npx supabase functions deploy sync-prices-cron
```

Then set up the cron job using Option A above.

---

## What Happens After Setup?

✅ **Immediately**: Background sync errors stop (403 fixed)
✅ **After setup**: App continues to sync prices on startup
✅ **With cron** (optional): Prices sync every 12 hours automatically (6 AM & 6 PM IST)
✅ **After 2-3 days**: Price Trends page shows real historical graphs
✅ **After 7+ days**: Full trend analysis with accurate data

---

## Testing

### Test if RLS fix worked:
1. Reload your app
2. Check browser console - 403 errors should be gone
3. Price data should sync successfully

### Test manual sync:
```sql
-- Run this in SQL Editor to manually trigger sync
SELECT net.http_post(
  url := 'https://oxqkzzglonsganfcouob.supabase.co/functions/v1/sync-prices-cron',
  headers := '{"Content-Type": "application/json"}'::jsonb
);
```

---

## Priority

1. **DO NOW**: Step 1 (RLS fix) - Fixes current errors ⚠️
2. **OPTIONAL**: Step 2 (Cron) - For automatic updates 🔄
3. **WAIT**: Price trends need 2-3 days of data 📊

---

Need help? Check CRON_SETUP.md for detailed instructions.
