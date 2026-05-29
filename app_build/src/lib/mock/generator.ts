// =============================================================================
// Dynamic Mock Data Generator
// =============================================================================
// Produces smoothly fluctuating mock quota data that simulates realistic
// usage patterns over time. Uses a combination of:
//   - Sinusoidal waves (daily usage cycles)
//   - Perlin-like noise (random but smooth variation)
//   - Time-of-day awareness (higher usage during work hours)
//   - Gradual accumulation (costs grow over the month)
//
// This generator is deterministic for a given timestamp, so the same
// moment always produces the same data — useful for testing.
// =============================================================================

import type {
  NormalizedQuota,
  QuotaBucket,
  QuotaStatus,
  Tier,
  CostDataPoint,
  ProviderId,
} from "@/lib/providers/types";

// ---------------------------------------------------------------------------
// Noise & Wave Functions
// ---------------------------------------------------------------------------

/**
 * Simple hash-based pseudo-random number generator.
 * Deterministic for the same seed — produces values in [0, 1).
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Smooth noise function using cosine interpolation between seeded values.
 * Returns a value in [0, 1).
 */
function smoothNoise(t: number, seed: number): number {
  const i = Math.floor(t);
  const f = t - i;
  // Cosine interpolation for smooth transitions
  const blend = (1 - Math.cos(f * Math.PI)) / 2;
  const a = seededRandom(i + seed);
  const b = seededRandom(i + 1 + seed);
  return a * (1 - blend) + b * blend;
}

/**
 * Multi-octave noise for richer variation.
 * Combines multiple frequencies for a natural feel.
 */
function fractalNoise(t: number, seed: number, octaves: number = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmplitude = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(t * frequency, seed + i * 100) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxAmplitude;
}

/**
 * Simulate a daily usage cycle.
 * Peak usage during 9 AM – 6 PM (UTC), low usage at night.
 * Returns a multiplier in [0.1, 1.0].
 */
function dailyCycleMultiplier(date: Date): number {
  const hour = date.getUTCHours();
  // Sine wave peaking at 13:00 UTC (1 PM)
  const radians = ((hour - 5) / 24) * Math.PI * 2;
  const wave = (Math.sin(radians) + 1) / 2; // [0, 1]
  return 0.1 + wave * 0.9; // [0.1, 1.0]
}

/**
 * Simulate monthly cost accumulation.
 * Returns a fraction [0, 1] representing progress through the month.
 */
function monthProgress(date: Date): number {
  const day = date.getUTCDate();
  const daysInMonth = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    0,
  ).getUTCDate();
  return day / daysInMonth;
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

function deriveStatus(remaining: number, limit: number): QuotaStatus {
  if (limit <= 0 || remaining <= 0) return "exhausted";
  const ratio = remaining / limit;
  if (ratio >= 0.5) return "healthy";
  if (ratio >= 0.2) return "warning";
  return "critical";
}

// ---------------------------------------------------------------------------
// Model Configuration Templates
// ---------------------------------------------------------------------------

interface ModelTemplate {
  provider: string;
  model: string;
  tier: Tier;
  inputTokenLimit: number;
  outputTokenLimit: number;
  requestLimit: number;
  resetWindowSeconds: number;
  /** Approximate USD cost per 1M input tokens. */
  costPerMInput: number;
  /** Approximate USD cost per 1M output tokens. */
  costPerMOutput: number;
  /** Monthly budget in USD (null = unlimited). */
  budget: number | null;
  /** Seed offset for deterministic noise. */
  seed: number;
}

const MODEL_TEMPLATES: ModelTemplate[] = [
  // OpenAI
  {
    provider: "openai",
    model: "gpt-5.5",
    tier: "paid",
    inputTokenLimit: 2_000_000,
    outputTokenLimit: 800_000,
    requestLimit: 10_000,
    resetWindowSeconds: 60,
    costPerMInput: 2.5,
    costPerMOutput: 10,
    budget: 500,
    seed: 1,
  },
  {
    provider: "openai",
    model: "gpt-5.5-instant",
    tier: "paid",
    inputTokenLimit: 10_000_000,
    outputTokenLimit: 5_000_000,
    requestLimit: 30_000,
    resetWindowSeconds: 60,
    costPerMInput: 0.4,
    costPerMOutput: 1.6,
    budget: 200,
    seed: 2,
  },
  {
    provider: "openai",
    model: "o3",
    tier: "paid",
    inputTokenLimit: 500_000,
    outputTokenLimit: 200_000,
    requestLimit: 2_000,
    resetWindowSeconds: 60,
    costPerMInput: 10,
    costPerMOutput: 40,
    budget: 800,
    seed: 3,
  },
  // Anthropic
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    tier: "paid",
    inputTokenLimit: 2_000_000,
    outputTokenLimit: 800_000,
    requestLimit: 5_000,
    resetWindowSeconds: 60,
    costPerMInput: 3,
    costPerMOutput: 15,
    budget: 600,
    seed: 10,
  },
  {
    provider: "anthropic",
    model: "claude-3.5-haiku-20241022",
    tier: "paid",
    inputTokenLimit: 20_000_000,
    outputTokenLimit: 10_000_000,
    requestLimit: 50_000,
    resetWindowSeconds: 60,
    costPerMInput: 0.8,
    costPerMOutput: 4,
    budget: 150,
    seed: 11,
  },
  {
    provider: "anthropic",
    model: "claude-opus-4.8",
    tier: "enterprise",
    inputTokenLimit: 400_000,
    outputTokenLimit: 100_000,
    requestLimit: 1_000,
    resetWindowSeconds: 60,
    costPerMInput: 15,
    costPerMOutput: 75,
    budget: 2_000,
    seed: 12,
  },
  // Gemini
  {
    provider: "gemini",
    model: "gemini-3.1-pro",
    tier: "paid",
    inputTokenLimit: 4_000_000,
    outputTokenLimit: 1_000_000,
    requestLimit: 1_000,
    resetWindowSeconds: 60,
    costPerMInput: 1.25,
    costPerMOutput: 10,
    budget: 300,
    seed: 20,
  },
  {
    provider: "gemini",
    model: "gemini-3.5-flash",
    tier: "free",
    inputTokenLimit: 32_000_000,
    outputTokenLimit: 8_000_000,
    requestLimit: 1_500,
    resetWindowSeconds: 60,
    costPerMInput: 0.075,
    costPerMOutput: 0.3,
    budget: null,
    seed: 21,
  },
  // Groq
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    tier: "free",
    inputTokenLimit: 6_000,
    outputTokenLimit: 6_000,
    requestLimit: 30,
    resetWindowSeconds: 60,
    costPerMInput: 0.5,
    costPerMOutput: 1.5,
    budget: null,
    seed: 30,
  },
  {
    provider: "groq",
    model: "llama-4-scout",
    tier: "free",
    inputTokenLimit: 20_000,
    outputTokenLimit: 20_000,
    requestLimit: 30,
    resetWindowSeconds: 60,
    costPerMInput: 0.2,
    costPerMOutput: 0.8,
    budget: null,
    seed: 31,
  },
  {
    provider: "groq",
    model: "mixtral-8x7b-32768",
    tier: "free",
    inputTokenLimit: 5_000,
    outputTokenLimit: 5_000,
    requestLimit: 30,
    resetWindowSeconds: 60,
    costPerMInput: 0.27,
    costPerMOutput: 0.27,
    budget: null,
    seed: 32,
  },
  // Mistral
  {
    provider: "mistral",
    model: "mistral-medium-3.5",
    tier: "paid",
    inputTokenLimit: 5_000_000,
    outputTokenLimit: 2_000_000,
    requestLimit: 10_000,
    resetWindowSeconds: 60,
    costPerMInput: 2,
    costPerMOutput: 6,
    budget: 250,
    seed: 40,
  },
  {
    provider: "mistral",
    model: "mistral-small-4",
    tier: "paid",
    inputTokenLimit: 15_000_000,
    outputTokenLimit: 5_000_000,
    requestLimit: 30_000,
    resetWindowSeconds: 60,
    costPerMInput: 0.2,
    costPerMOutput: 0.6,
    budget: 100,
    seed: 41,
  },
  {
    provider: "mistral",
    model: "codestral-latest",
    tier: "paid",
    inputTokenLimit: 5_000_000,
    outputTokenLimit: 2_000_000,
    requestLimit: 10_000,
    resetWindowSeconds: 60,
    costPerMInput: 0.3,
    costPerMOutput: 0.9,
    budget: 150,
    seed: 42,
  },
];

// ---------------------------------------------------------------------------
// Core Generator
// ---------------------------------------------------------------------------

/**
 * Generate a single `NormalizedQuota` snapshot for a model template at a
 * specific point in time.
 *
 * The generated data is **deterministic** — the same `now` timestamp and
 * template always produce the same output.
 */
function generateQuotaForTemplate(
  template: ModelTemplate,
  now: Date,
): NormalizedQuota {
  // Time-based parameters
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
  const t = minuteOfDay / 60; // Fractional hour of day
  const cycle = dailyCycleMultiplier(now);
  const mp = monthProgress(now);

  // Noise values for each dimension (deterministic per seed + time)
  const noiseInput = fractalNoise(t * 0.3, template.seed);
  const noiseOutput = fractalNoise(t * 0.3, template.seed + 50);
  const noiseReq = fractalNoise(t * 0.3, template.seed + 100);

  // Usage ratios: combine daily cycle with noise
  // Base usage is 30–70% of limit, modulated by time of day
  const inputUsageRatio = Math.min(
    0.95,
    (0.3 + noiseInput * 0.4) * cycle,
  );
  const outputUsageRatio = Math.min(
    0.95,
    (0.25 + noiseOutput * 0.45) * cycle,
  );
  const requestUsageRatio = Math.min(
    0.95,
    (0.35 + noiseReq * 0.35) * cycle,
  );

  const inputUsed = Math.round(template.inputTokenLimit * inputUsageRatio);
  const outputUsed = Math.round(template.outputTokenLimit * outputUsageRatio);
  const requestsUsed = Math.round(template.requestLimit * requestUsageRatio);

  const inputRemaining = template.inputTokenLimit - inputUsed;
  const outputRemaining = template.outputTokenLimit - outputUsed;
  const requestsRemaining = template.requestLimit - requestsUsed;

  // Reset time: random offset within the window
  const resetOffset = Math.round(
    template.resetWindowSeconds * (0.3 + seededRandom(template.seed + minuteOfDay) * 0.7),
  );
  const resetAt = new Date(now.getTime() + resetOffset * 1000).toISOString();

  // Cost calculation
  // Daily cost: proportional to tokens used today, with noise
  const dailyInputCost =
    (inputUsed / 1_000_000) * template.costPerMInput * (0.8 + noiseInput * 0.4);
  const dailyOutputCost =
    (outputUsed / 1_000_000) * template.costPerMOutput * (0.8 + noiseOutput * 0.4);
  const todayCost = Math.round((dailyInputCost + dailyOutputCost) * 100) / 100;

  // Monthly cost: accumulates over the month
  const monthlyCostEstimate = todayCost * mp * 30 * (0.7 + noiseReq * 0.6);
  const thisMonthCost = Math.round(monthlyCostEstimate * 100) / 100;

  // Build quota buckets
  const inputTokens: QuotaBucket = {
    used: inputUsed,
    limit: template.inputTokenLimit,
    remaining: inputRemaining,
    resetAt,
  };

  const outputTokens: QuotaBucket = {
    used: outputUsed,
    limit: template.outputTokenLimit,
    remaining: outputRemaining,
    resetAt,
  };

  const requests: QuotaBucket = {
    used: requestsUsed,
    limit: template.requestLimit,
    remaining: requestsRemaining,
    resetAt,
  };

  // Derive status from worst bucket
  const worstRatio = Math.min(
    inputRemaining / template.inputTokenLimit,
    outputRemaining / template.outputTokenLimit,
    requestsRemaining / template.requestLimit,
  );

  return {
    provider: template.provider,
    model: template.model,
    tier: template.tier,
    inputTokens,
    outputTokens,
    requests,
    cost: {
      today: todayCost,
      thisMonth: thisMonthCost,
      budget: template.budget,
    },
    status: deriveStatus(Math.round(worstRatio * 100), 100),
    timestamp: now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete set of mock quota snapshots for all providers and
 * models at the given point in time.
 *
 * @param now — The reference timestamp (defaults to current time).
 * @returns Array of `NormalizedQuota` snapshots for all 14 model configs.
 *
 * @example
 * // Get current mock data
 * const quotas = generateAllMockQuotas();
 *
 * // Get mock data for a specific time
 * const quotas = generateAllMockQuotas(new Date("2025-03-15T14:30:00Z"));
 */
export function generateAllMockQuotas(
  now: Date = new Date(),
): NormalizedQuota[] {
  return MODEL_TEMPLATES.map((template) =>
    generateQuotaForTemplate(template, now),
  );
}

/**
 * Generate mock quota snapshots for a single provider at the given time.
 *
 * @param providerId — Provider id (e.g. `"openai"`, `"anthropic"`).
 * @param now — The reference timestamp (defaults to current time).
 */
export function generateMockQuotasForProvider(
  providerId: string,
  now: Date = new Date(),
): NormalizedQuota[] {
  return MODEL_TEMPLATES.filter((t) => t.provider === providerId).map(
    (template) => generateQuotaForTemplate(template, now),
  );
}

/**
 * Generate a mock quota snapshot for a single model at the given time.
 *
 * @param modelId — Model id (e.g. `"gpt-4o"`, `"claude-sonnet-4-20250514"`).
 * @param now — The reference timestamp (defaults to current time).
 * @returns The quota snapshot, or `null` if the model is not in templates.
 */
export function generateMockQuotaForModel(
  modelId: string,
  now: Date = new Date(),
): NormalizedQuota | null {
  const template = MODEL_TEMPLATES.find((t) => t.model === modelId);
  if (!template) return null;
  return generateQuotaForTemplate(template, now);
}

/**
 * Generate a time series of mock quota snapshots for a model over a
 * time range. Useful for rendering historical charts.
 *
 * @param modelId — Model id to generate data for.
 * @param from — Start of the time range.
 * @param to — End of the time range.
 * @param intervalMinutes — Interval between data points (default: 5).
 * @returns Array of quota snapshots at each interval.
 *
 * @example
 * const series = generateMockTimeSeries(
 *   "gpt-4o",
 *   new Date("2025-03-15T00:00:00Z"),
 *   new Date("2025-03-15T23:59:59Z"),
 *   15, // every 15 minutes
 * );
 */
export function generateMockTimeSeries(
  modelId: string,
  from: Date,
  to: Date,
  intervalMinutes: number = 5,
): NormalizedQuota[] {
  const template = MODEL_TEMPLATES.find((t) => t.model === modelId);
  if (!template) return [];

  const results: NormalizedQuota[] = [];
  const intervalMs = intervalMinutes * 60 * 1000;
  let current = from.getTime();

  while (current <= to.getTime()) {
    results.push(generateQuotaForTemplate(template, new Date(current)));
    current += intervalMs;
  }

  return results;
}

/**
 * Generate aggregate cost data grouped by provider for the current time.
 * Returns a summary object with per-provider and total costs.
 */
export function generateMockCostSummary(now: Date = new Date()): {
  byProvider: Record<string, { today: number; thisMonth: number; budget: number | null }>;
  total: { today: number; thisMonth: number; totalBudget: number };
} {
  const quotas = generateAllMockQuotas(now);
  const byProvider: Record<
    string,
    { today: number; thisMonth: number; budget: number | null }
  > = {};

  for (const q of quotas) {
    if (!byProvider[q.provider]) {
      byProvider[q.provider] = { today: 0, thisMonth: 0, budget: 0 };
    }
    const p = byProvider[q.provider];
    p.today = Math.round((p.today + q.cost.today) * 100) / 100;
    p.thisMonth = Math.round((p.thisMonth + q.cost.thisMonth) * 100) / 100;
    if (q.cost.budget !== null) {
      p.budget = ((p.budget as number) ?? 0) + q.cost.budget;
    }
  }

  const total = {
    today: Object.values(byProvider).reduce((s, p) => s + p.today, 0),
    thisMonth: Object.values(byProvider).reduce((s, p) => s + p.thisMonth, 0),
    totalBudget: Object.values(byProvider).reduce(
      (s, p) => s + ((p.budget as number) ?? 0),
      0,
    ),
  };

  return { byProvider, total };
}

/**
 * Generate an array of mock cost data points for historical charts.
 * @param days - The number of days to generate history for
 */
export function generateMockCostHistory(days: number): CostDataPoint[] {
  const data: CostDataPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const summary = generateMockCostSummary(d);
    
    const point: CostDataPoint = {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    
    for (const [provider, costs] of Object.entries(summary.byProvider)) {
      point[provider as ProviderId] = costs.today;
    }
    
    data.push(point);
  }
  
  return data;
}
