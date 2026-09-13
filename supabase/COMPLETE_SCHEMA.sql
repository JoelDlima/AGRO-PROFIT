-- ====================================================================
-- AGRO PROFIT / AGRO PROFIT PRO - COMPLETE MASTER DATABASE SCHEMA
-- ====================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "+ New query", paste this entire script, and click "Run" (Ctrl+Enter)
--
-- This script creates:
--   1. profiles (User onboarding, language preferences, location)
--   2. mandi_prices_cache (Government Mandi price cache + auto-cleanup)
--   3. price_history (Historical 15-day price trend analysis)
--   4. forum_posts, forum_comments, forum_likes (Community Forum with counter triggers)
--   5. crop_scans (AI Crop Health / Plant Disease scan history & diagnosis)
--   6. storage.buckets ('crop-scans' for leaf photo uploads)
--   7. Full Row-Level Security (RLS) policies and performance indexes
-- ====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES TABLE (User Profile & Onboarding)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  state TEXT,
  crops TEXT[],
  preferred_language TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ====================================================================
-- 2. MANDI PRICES CACHE TABLE (Government of India Mandi Data)
-- ====================================================================
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
  
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_market_commodity UNIQUE (commodity, market, district, state, arrival_date)
);

CREATE INDEX IF NOT EXISTS idx_mandi_commodity ON public.mandi_prices_cache(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_state ON public.mandi_prices_cache(state);
CREATE INDEX IF NOT EXISTS idx_mandi_fetched_at ON public.mandi_prices_cache(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_arrival_date ON public.mandi_prices_cache(arrival_date DESC);

ALTER TABLE public.mandi_prices_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read mandi prices" ON public.mandi_prices_cache;
CREATE POLICY "Anyone can read mandi prices" ON public.mandi_prices_cache FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Service role can manage mandi prices" ON public.mandi_prices_cache;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.mandi_prices_cache;
CREATE POLICY "Enable insert for all users" ON public.mandi_prices_cache FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.mandi_prices_cache;
CREATE POLICY "Enable update for all users" ON public.mandi_prices_cache FOR UPDATE USING (true) WITH CHECK (true);

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


-- ====================================================================
-- 3. PRICE HISTORY TABLE (15-Day Trends & Analytics)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  market TEXT NOT NULL,
  modal_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_commodity ON public.price_history(commodity);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON public.price_history(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_composite ON public.price_history(commodity, state, recorded_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_history_unique ON public.price_history(commodity, state, market, recorded_date);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.price_history;
CREATE POLICY "Enable read access for all users" ON public.price_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.price_history;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.price_history;
CREATE POLICY "Enable insert for all users" ON public.price_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.price_history;
CREATE POLICY "Enable update for all users" ON public.price_history FOR UPDATE USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.cleanup_old_price_history()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.price_history
  WHERE recorded_date < CURRENT_DATE - INTERVAL '15 days';
END;
$$;


-- ====================================================================
-- 4. COMMUNITY FORUM (Posts, Comments, Likes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'price-discussion', 'crop-advice', 'weather', 'schemes', 'general'
  crop TEXT,
  state TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user ON public.forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_likes_unique_post ON public.forum_likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_likes_unique_comment ON public.forum_likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_posts;
CREATE POLICY "Enable read access for all users" ON public.forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.forum_posts;
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for post owners" ON public.forum_posts;
CREATE POLICY "Enable update for post owners" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for post owners" ON public.forum_posts;
CREATE POLICY "Enable delete for post owners" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_comments;
CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.forum_comments;
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for comment owners" ON public.forum_comments;
CREATE POLICY "Enable update for comment owners" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for comment owners" ON public.forum_comments;
CREATE POLICY "Enable delete for comment owners" ON public.forum_comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_likes;
CREATE POLICY "Enable read access for all users" ON public.forum_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.forum_likes;
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for like owners" ON public.forum_likes;
CREATE POLICY "Enable delete for like owners" ON public.forum_likes FOR DELETE USING (auth.uid() = user_id);

-- Forum triggers for counts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON public.forum_comments;
CREATE TRIGGER trigger_update_post_comment_count
AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE public.forum_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE public.forum_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.forum_likes;
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.forum_likes
FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS trigger_forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER trigger_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_forum_comments_updated_at ON public.forum_comments;
CREATE TRIGGER trigger_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ====================================================================
-- 5. CROP SCANS TABLE (Plant Disease Scanning & Diagnosis)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.crop_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Scan metadata
  scan_type text NOT NULL DEFAULT 'plant' CHECK (scan_type IN ('plant', 'crop')),
  provider text NOT NULL DEFAULT 'plant_id' CHECK (provider IN ('plant_id', 'crop_health')),

  -- Crop info
  crop_name text NOT NULL,
  location text DEFAULT 'Field Scan',
  image_url text,

  -- Disease detection results
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'small_problem', 'medium_problem', 'big_problem')),
  disease_name text,
  disease_severity text CHECK (disease_severity IS NULL OR disease_severity IN ('low', 'medium', 'high')),
  disease_confidence numeric CHECK (disease_confidence IS NULL OR (disease_confidence >= 0 AND disease_confidence <= 100)),
  disease_description text,

  -- AI treatment info
  treatment_summary text,
  treatment_steps jsonb DEFAULT '[]'::jsonb,
  ai_explanation jsonb DEFAULT '{}'::jsonb,

  -- Raw API payloads (for debugging)
  request_payload jsonb DEFAULT '{}'::jsonb,
  response_payload jsonb DEFAULT '{}'::jsonb,

  -- Language used for AI explanation
  ai_language text DEFAULT 'en',

  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crop scans" ON public.crop_scans;
CREATE POLICY "Users can view own crop scans"
  ON public.crop_scans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own crop scans" ON public.crop_scans;
CREATE POLICY "Users can insert own crop scans"
  ON public.crop_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own crop scans" ON public.crop_scans;
CREATE POLICY "Users can delete own crop scans"
  ON public.crop_scans FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_crop_scans_user_id ON public.crop_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_created_at ON public.crop_scans(created_at DESC);


-- ====================================================================
-- 6. STORAGE BUCKET FOR CROP SCAN IMAGES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-scans', 'crop-scans', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to crop scans" ON storage.objects;
CREATE POLICY "Public access to crop scans"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-scans');

DROP POLICY IF EXISTS "Authenticated users can upload crop scans" ON storage.objects;
CREATE POLICY "Authenticated users can upload crop scans"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crop-scans' AND auth.role() = 'authenticated');


-- ====================================================================
-- 7. REFRESH POSTGREST SCHEMA CACHE
-- ====================================================================
SELECT pg_notify('pgrst', 'reload schema');
