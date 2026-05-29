-- =====================================================================
-- MASTER SUPABASE SETUP SCRIPT FOR CEIL DASHBOARD
-- =====================================================================
-- Run this entire script in your Supabase SQL Editor to set up:
-- 1. Helper function for auth claims (Clerk & Supabase)
-- 2. provider_pricing table (public read rate cards)
-- 3. usage_snapshots table (user-specific usage history)
-- 4. alert_configs table (user-specific budget alert configurations)
-- 5. Row Level Security (RLS) policies for all tables
-- =====================================================================

-- =====================================================================
-- 1. AUTH HELPER FUNCTION
-- =====================================================================
-- Extracts the requesting user ID from Supabase Auth OR Clerk JWT claims
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT auth.uid()::text),
    (SELECT (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'sub')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- =====================================================================
-- 2. TABLE: provider_pricing (Static / Public Rate Card)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.provider_pricing (
  provider_id TEXT PRIMARY KEY,
  cost_input_1k NUMERIC NOT NULL,
  cost_output_1k NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.provider_pricing ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone (so the client can fetch rates)
DROP POLICY IF EXISTS "Allow public read access" ON public.provider_pricing;
CREATE POLICY "Allow public read access" ON public.provider_pricing
  FOR SELECT TO anon, authenticated
  USING (true);

-- Seed initial default pricing rate configs
INSERT INTO public.provider_pricing (provider_id, cost_input_1k, cost_output_1k) VALUES
  ('openai', 0.0025, 0.0100),   -- Input/Output cost per 1k tokens
  ('anthropic', 0.0030, 0.0150),
  ('gemini', 0.0070, 0.0210),
  ('groq', 0.0001, 0.0002),
  ('mistral', 0.0015, 0.0045)
ON CONFLICT (provider_id) DO UPDATE SET
  cost_input_1k = EXCLUDED.cost_input_1k,
  cost_output_1k = EXCLUDED.cost_output_1k;


-- =====================================================================
-- 3. TABLE: usage_snapshots (User Specific Logs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.usage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  input_tokens_used BIGINT DEFAULT 0,
  output_tokens_used BIGINT DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Restricted to owner only)
DROP POLICY IF EXISTS "Users can insert their own usage snapshots" ON public.usage_snapshots;
CREATE POLICY "Users can insert their own usage snapshots" ON public.usage_snapshots
  FOR INSERT TO authenticated, anon
  WITH CHECK (user_id = public.requesting_user_id());

DROP POLICY IF EXISTS "Users can select their own usage snapshots" ON public.usage_snapshots;
CREATE POLICY "Users can select their own usage snapshots" ON public.usage_snapshots
  FOR SELECT TO authenticated, anon
  USING (user_id = public.requesting_user_id());

DROP POLICY IF EXISTS "Users can delete their own usage snapshots" ON public.usage_snapshots;
CREATE POLICY "Users can delete their own usage snapshots" ON public.usage_snapshots
  FOR DELETE TO authenticated, anon
  USING (user_id = public.requesting_user_id());


-- =====================================================================
-- 4. TABLE: alert_configs (User Specific Budget Configs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  velocity_threshold_pct NUMERIC(5,2) DEFAULT 300.00,
  budget_limit_usd NUMERIC(10,2),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.alert_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Restricted to owner only)
DROP POLICY IF EXISTS "Users can insert their own alert configs" ON public.alert_configs;
CREATE POLICY "Users can insert their own alert configs" ON public.alert_configs
  FOR INSERT TO authenticated, anon
  WITH CHECK (user_id = public.requesting_user_id());

DROP POLICY IF EXISTS "Users can select their own alert configs" ON public.alert_configs;
CREATE POLICY "Users can select their own alert configs" ON public.alert_configs
  FOR SELECT TO authenticated, anon
  USING (user_id = public.requesting_user_id());

DROP POLICY IF EXISTS "Users can update their own alert configs" ON public.alert_configs;
CREATE POLICY "Users can update their own alert configs" ON public.alert_configs
  FOR UPDATE TO authenticated, anon
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

DROP POLICY IF EXISTS "Users can delete their own alert configs" ON public.alert_configs;
CREATE POLICY "Users can delete their own alert configs" ON public.alert_configs
  FOR DELETE TO authenticated, anon
  USING (user_id = public.requesting_user_id());
