// =============================================================================
// Static Mock Data
// =============================================================================
// Realistic, hand-crafted mock quota snapshots for all 5 providers.
// Uses actual model names, plausible token counts, and realistic cost figures
// so the dashboard can be developed and demoed without real API keys.
// =============================================================================

import type { NormalizedQuota } from "@/lib/providers/types";

// ---------------------------------------------------------------------------
// Helper: create an ISO-8601 timestamp N seconds from now
// ---------------------------------------------------------------------------

function futureISO(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// OpenAI Mock Data
// ---------------------------------------------------------------------------

export const MOCK_OPENAI_GPT4O: NormalizedQuota = {
  provider: "openai",
  model: "gpt-4o",
  tier: "paid",
  inputTokens: {
    used: 823_450,
    limit: 2_000_000,
    remaining: 1_176_550,
    resetAt: futureISO(42),
  },
  outputTokens: {
    used: 312_800,
    limit: 800_000,
    remaining: 487_200,
    resetAt: futureISO(42),
  },
  requests: {
    used: 4_287,
    limit: 10_000,
    remaining: 5_713,
    resetAt: futureISO(42),
  },
  cost: {
    today: 14.37,
    thisMonth: 287.52,
    budget: 500,
  },
  status: "healthy",
  timestamp: nowISO(),
};

export const MOCK_OPENAI_GPT41_MINI: NormalizedQuota = {
  provider: "openai",
  model: "gpt-4.1-mini",
  tier: "paid",
  inputTokens: {
    used: 3_456_000,
    limit: 10_000_000,
    remaining: 6_544_000,
    resetAt: futureISO(38),
  },
  outputTokens: {
    used: 1_890_000,
    limit: 5_000_000,
    remaining: 3_110_000,
    resetAt: futureISO(38),
  },
  requests: {
    used: 12_450,
    limit: 30_000,
    remaining: 17_550,
    resetAt: futureISO(38),
  },
  cost: {
    today: 3.21,
    thisMonth: 64.80,
    budget: 200,
  },
  status: "healthy",
  timestamp: nowISO(),
};

export const MOCK_OPENAI_O3: NormalizedQuota = {
  provider: "openai",
  model: "o3",
  tier: "paid",
  inputTokens: {
    used: 145_000,
    limit: 500_000,
    remaining: 355_000,
    resetAt: futureISO(55),
  },
  outputTokens: {
    used: 89_200,
    limit: 200_000,
    remaining: 110_800,
    resetAt: futureISO(55),
  },
  requests: {
    used: 890,
    limit: 2_000,
    remaining: 1_110,
    resetAt: futureISO(55),
  },
  cost: {
    today: 42.15,
    thisMonth: 534.20,
    budget: 800,
  },
  status: "warning",
  timestamp: nowISO(),
};

// ---------------------------------------------------------------------------
// Anthropic Mock Data
// ---------------------------------------------------------------------------

export const MOCK_ANTHROPIC_SONNET: NormalizedQuota = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  tier: "paid",
  inputTokens: {
    used: 1_245_000,
    limit: 2_000_000,
    remaining: 755_000,
    resetAt: futureISO(32),
  },
  outputTokens: {
    used: 398_000,
    limit: 800_000,
    remaining: 402_000,
    resetAt: futureISO(32),
  },
  requests: {
    used: 3_890,
    limit: 5_000,
    remaining: 1_110,
    resetAt: futureISO(32),
  },
  cost: {
    today: 18.92,
    thisMonth: 412.30,
    budget: 600,
  },
  status: "warning",
  timestamp: nowISO(),
};

export const MOCK_ANTHROPIC_HAIKU: NormalizedQuota = {
  provider: "anthropic",
  model: "claude-3.5-haiku-20241022",
  tier: "paid",
  inputTokens: {
    used: 5_670_000,
    limit: 20_000_000,
    remaining: 14_330_000,
    resetAt: futureISO(28),
  },
  outputTokens: {
    used: 2_340_000,
    limit: 10_000_000,
    remaining: 7_660_000,
    resetAt: futureISO(28),
  },
  requests: {
    used: 18_900,
    limit: 50_000,
    remaining: 31_100,
    resetAt: futureISO(28),
  },
  cost: {
    today: 2.84,
    thisMonth: 56.70,
    budget: 150,
  },
  status: "healthy",
  timestamp: nowISO(),
};

export const MOCK_ANTHROPIC_OPUS: NormalizedQuota = {
  provider: "anthropic",
  model: "claude-opus-4-20250514",
  tier: "enterprise",
  inputTokens: {
    used: 89_000,
    limit: 400_000,
    remaining: 311_000,
    resetAt: futureISO(45),
  },
  outputTokens: {
    used: 34_200,
    limit: 100_000,
    remaining: 65_800,
    resetAt: futureISO(45),
  },
  requests: {
    used: 245,
    limit: 1_000,
    remaining: 755,
    resetAt: futureISO(45),
  },
  cost: {
    today: 67.45,
    thisMonth: 1_230.80,
    budget: 2_000,
  },
  status: "healthy",
  timestamp: nowISO(),
};

// ---------------------------------------------------------------------------
// Google Gemini Mock Data
// ---------------------------------------------------------------------------

export const MOCK_GEMINI_PRO: NormalizedQuota = {
  provider: "gemini",
  model: "gemini-2.5-pro",
  tier: "paid",
  inputTokens: {
    used: 2_890_000,
    limit: 4_000_000,
    remaining: 1_110_000,
    resetAt: futureISO(48),
  },
  outputTokens: {
    used: 456_000,
    limit: 1_000_000,
    remaining: 544_000,
    resetAt: futureISO(48),
  },
  requests: {
    used: 850,
    limit: 1_000,
    remaining: 150,
    resetAt: futureISO(48),
  },
  cost: {
    today: 8.92,
    thisMonth: 178.40,
    budget: 300,
  },
  status: "critical",
  timestamp: nowISO(),
};

export const MOCK_GEMINI_FLASH: NormalizedQuota = {
  provider: "gemini",
  model: "gemini-2.5-flash",
  tier: "free",
  inputTokens: {
    used: 12_400_000,
    limit: 32_000_000,
    remaining: 19_600_000,
    resetAt: futureISO(35),
  },
  outputTokens: {
    used: 4_100_000,
    limit: 8_000_000,
    remaining: 3_900_000,
    resetAt: futureISO(35),
  },
  requests: {
    used: 780,
    limit: 1_500,
    remaining: 720,
    resetAt: futureISO(35),
  },
  cost: {
    today: 0,
    thisMonth: 0,
    budget: null,
  },
  status: "healthy",
  timestamp: nowISO(),
};

// ---------------------------------------------------------------------------
// Groq Mock Data
// ---------------------------------------------------------------------------

export const MOCK_GROQ_LLAMA70B: NormalizedQuota = {
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  tier: "free",
  inputTokens: {
    used: 4_500,
    limit: 6_000,
    remaining: 1_500,
    resetAt: futureISO(22),
  },
  outputTokens: {
    used: 3_800,
    limit: 6_000,
    remaining: 2_200,
    resetAt: futureISO(22),
  },
  requests: {
    used: 24,
    limit: 30,
    remaining: 6,
    resetAt: futureISO(22),
  },
  cost: {
    today: 0,
    thisMonth: 0,
    budget: null,
  },
  status: "warning",
  timestamp: nowISO(),
};

export const MOCK_GROQ_LLAMA8B: NormalizedQuota = {
  provider: "groq",
  model: "llama-3.1-8b-instant",
  tier: "free",
  inputTokens: {
    used: 18_000,
    limit: 20_000,
    remaining: 2_000,
    resetAt: futureISO(18),
  },
  outputTokens: {
    used: 17_500,
    limit: 20_000,
    remaining: 2_500,
    resetAt: futureISO(18),
  },
  requests: {
    used: 25,
    limit: 30,
    remaining: 5,
    resetAt: futureISO(18),
  },
  cost: {
    today: 0,
    thisMonth: 0,
    budget: null,
  },
  status: "critical",
  timestamp: nowISO(),
};

export const MOCK_GROQ_MIXTRAL: NormalizedQuota = {
  provider: "groq",
  model: "mixtral-8x7b-32768",
  tier: "free",
  inputTokens: {
    used: 2_100,
    limit: 5_000,
    remaining: 2_900,
    resetAt: futureISO(26),
  },
  outputTokens: {
    used: 1_800,
    limit: 5_000,
    remaining: 3_200,
    resetAt: futureISO(26),
  },
  requests: {
    used: 12,
    limit: 30,
    remaining: 18,
    resetAt: futureISO(26),
  },
  cost: {
    today: 0,
    thisMonth: 0,
    budget: null,
  },
  status: "healthy",
  timestamp: nowISO(),
};

// ---------------------------------------------------------------------------
// Mistral Mock Data
// ---------------------------------------------------------------------------

export const MOCK_MISTRAL_LARGE: NormalizedQuota = {
  provider: "mistral",
  model: "mistral-large-latest",
  tier: "paid",
  inputTokens: {
    used: 1_670_000,
    limit: 5_000_000,
    remaining: 3_330_000,
    resetAt: futureISO(40),
  },
  outputTokens: {
    used: 520_000,
    limit: 2_000_000,
    remaining: 1_480_000,
    resetAt: futureISO(40),
  },
  requests: {
    used: 2_340,
    limit: 10_000,
    remaining: 7_660,
    resetAt: futureISO(40),
  },
  cost: {
    today: 6.78,
    thisMonth: 145.20,
    budget: 250,
  },
  status: "healthy",
  timestamp: nowISO(),
};

export const MOCK_MISTRAL_SMALL: NormalizedQuota = {
  provider: "mistral",
  model: "mistral-small-latest",
  tier: "paid",
  inputTokens: {
    used: 8_900_000,
    limit: 15_000_000,
    remaining: 6_100_000,
    resetAt: futureISO(30),
  },
  outputTokens: {
    used: 3_200_000,
    limit: 5_000_000,
    remaining: 1_800_000,
    resetAt: futureISO(30),
  },
  requests: {
    used: 15_600,
    limit: 30_000,
    remaining: 14_400,
    resetAt: futureISO(30),
  },
  cost: {
    today: 1.92,
    thisMonth: 38.40,
    budget: 100,
  },
  status: "healthy",
  timestamp: nowISO(),
};

export const MOCK_MISTRAL_CODESTRAL: NormalizedQuota = {
  provider: "mistral",
  model: "codestral-latest",
  tier: "paid",
  inputTokens: {
    used: 4_200_000,
    limit: 5_000_000,
    remaining: 800_000,
    resetAt: futureISO(36),
  },
  outputTokens: {
    used: 1_800_000,
    limit: 2_000_000,
    remaining: 200_000,
    resetAt: futureISO(36),
  },
  requests: {
    used: 8_900,
    limit: 10_000,
    remaining: 1_100,
    resetAt: futureISO(36),
  },
  cost: {
    today: 4.56,
    thisMonth: 91.20,
    budget: 150,
  },
  status: "critical",
  timestamp: nowISO(),
};

// ---------------------------------------------------------------------------
// Aggregated collections
// ---------------------------------------------------------------------------

/** All mock quotas grouped by provider id. */
export const MOCK_QUOTAS_BY_PROVIDER: Record<string, NormalizedQuota[]> = {
  openai: [MOCK_OPENAI_GPT4O, MOCK_OPENAI_GPT41_MINI, MOCK_OPENAI_O3],
  anthropic: [MOCK_ANTHROPIC_SONNET, MOCK_ANTHROPIC_HAIKU, MOCK_ANTHROPIC_OPUS],
  gemini: [MOCK_GEMINI_PRO, MOCK_GEMINI_FLASH],
  groq: [MOCK_GROQ_LLAMA70B, MOCK_GROQ_LLAMA8B, MOCK_GROQ_MIXTRAL],
  mistral: [MOCK_MISTRAL_LARGE, MOCK_MISTRAL_SMALL, MOCK_MISTRAL_CODESTRAL],
};

/** Flat array of all mock quotas (all providers, all models). */
export const ALL_MOCK_QUOTAS: NormalizedQuota[] = Object.values(
  MOCK_QUOTAS_BY_PROVIDER,
).flat();

/**
 * Total mock cost summary across all providers.
 * Useful for the dashboard header's aggregate cost display.
 */
export const MOCK_TOTAL_COST = {
  today: ALL_MOCK_QUOTAS.reduce((sum, q) => sum + q.cost.today, 0),
  thisMonth: ALL_MOCK_QUOTAS.reduce((sum, q) => sum + q.cost.thisMonth, 0),
  totalBudget: ALL_MOCK_QUOTAS.reduce(
    (sum, q) => sum + (q.cost.budget ?? 0),
    0,
  ),
};
