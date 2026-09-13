-- Fix RLS policies for background price sync
-- Allow anonymous inserts for price_history and mandi_prices_cache
-- These are public market data tables, not user-specific

-- ============================================
-- PRICE HISTORY TABLE - Allow public inserts
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON price_history;

-- Allow anyone to insert price history (public market data)
CREATE POLICY "Enable insert for all users" ON price_history
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update price history (for upserts)
CREATE POLICY "Enable update for all users" ON price_history
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- MANDI PRICES CACHE - Allow public inserts
-- ============================================

-- Drop the restrictive service_role-only policy
DROP POLICY IF EXISTS "Service role can manage mandi prices" ON mandi_prices_cache;

-- Allow anyone to insert/update mandi prices (public market data)
CREATE POLICY "Enable insert for all users" ON mandi_prices_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON mandi_prices_cache
  FOR UPDATE USING (true) WITH CHECK (true);

-- Keep read policy as is (already public)
