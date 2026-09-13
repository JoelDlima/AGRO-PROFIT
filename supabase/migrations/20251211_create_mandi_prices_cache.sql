-- Create table to cache mandi prices
CREATE TABLE IF NOT EXISTS public.mandi_prices_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  district VARCHAR(100),
  market VARCHAR(200) NOT NULL,
  variety VARCHAR(100),
  grade VARCHAR(50),
  arrival_date DATE,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  modal_price DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for faster queries
  CONSTRAINT unique_market_commodity UNIQUE (commodity, market, district, state, arrival_date)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_mandi_commodity ON public.mandi_prices_cache(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_state ON public.mandi_prices_cache(state);
CREATE INDEX IF NOT EXISTS idx_mandi_fetched_at ON public.mandi_prices_cache(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_arrival_date ON public.mandi_prices_cache(arrival_date DESC);

-- Enable Row Level Security
ALTER TABLE public.mandi_prices_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Anyone can read mandi prices"
  ON public.mandi_prices_cache
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update (for scheduled functions)
CREATE POLICY "Service role can manage mandi prices"
  ON public.mandi_prices_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean old data (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_mandi_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.mandi_prices_cache
  WHERE fetched_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Comment on table
COMMENT ON TABLE public.mandi_prices_cache IS 'Cached mandi prices from Government API - refreshed every 12 hours';
