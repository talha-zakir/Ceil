-- ==========================================
-- Supabase Setup Script for Ceil Dashboard
-- ==========================================

-- 1. Create the provider_pricing table
CREATE TABLE IF NOT EXISTS public.provider_pricing (
  provider_id TEXT PRIMARY KEY,
  cost_input_1k NUMERIC NOT NULL,
  cost_output_1k NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.provider_pricing ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy allowing everyone to read the pricing config
-- (Using recommended TO anon/authenticated structure over deprecated auth.role())
DROP POLICY IF EXISTS "Allow public read access" ON public.provider_pricing;
CREATE POLICY "Allow public read access" ON public.provider_pricing
  FOR SELECT TO anon, authenticated
  USING (true);

-- 4. Insert default/mock LLM pricing data
INSERT INTO public.provider_pricing (provider_id, cost_input_1k, cost_output_1k) VALUES
  ('openai', 0.0025, 0.0100),   -- Input/Output cost per 1k tokens
  ('anthropic', 0.0030, 0.0150),
  ('gemini', 0.0070, 0.0210),
  ('groq', 0.0001, 0.0002),
  ('mistral', 0.0015, 0.0045)
ON CONFLICT (provider_id) DO UPDATE SET
  cost_input_1k = EXCLUDED.cost_input_1k,
  cost_output_1k = EXCLUDED.cost_output_1k;
