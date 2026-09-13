-- ============================================================
-- AgroProfit Pro - CropGuard Feature Tables
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================
-- These tables add Crop Health scanning + AI diagnosis history
-- to your existing AgroProfit Supabase project.
-- The profiles table already exists — we reference it via profiles(id).
-- ============================================================

-- 1) CROP SCANS TABLE
-- Stores every crop disease scan (Plant.id / crop.health results)
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

-- Enable RLS
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scans
CREATE POLICY "Users can view own crop scans"
  ON public.crop_scans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert own crop scans"
  ON public.crop_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete own crop scans"
  ON public.crop_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_crop_scans_user_id ON public.crop_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_created_at ON public.crop_scans(created_at DESC);

-- 2) STORAGE BUCKET FOR SCAN IMAGES (optional but recommended)
-- Run this separately if you want to store scan images in Supabase Storage:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('crop-scans', 'crop-scans', true);

-- Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');
