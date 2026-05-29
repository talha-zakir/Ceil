// =============================================================================
// Provider Adapter Layer — Core Type Definitions
// =============================================================================
// Normalized interfaces for cross-provider LLM quota, cost, and rate-limit
// tracking. Every provider adapter maps its proprietary header schema into
// these shared types so the dashboard can render a unified view.
// =============================================================================

/** Subscription tier reported (or inferred) from provider metadata. */
export type Tier = "free" | "paid" | "enterprise";

/** Aggregate health status derived from remaining quota percentages. */
export type QuotaStatus = "healthy" | "warning" | "critical" | "exhausted";

// ---------------------------------------------------------------------------
// Token / Request bucket
// ---------------------------------------------------------------------------

/**
 * A single quota bucket — tokens or requests — with usage, limit, remaining
 * count, and the UTC timestamp at which the bucket resets.
 */
export interface QuotaBucket {
  /** Amount consumed in the current window. */
  used: number;
  /** Maximum allowed in the current window (`Infinity` when unlimited). */
  limit: number;
  /** Remaining allowance (`limit - used`). */
  remaining: number;
  /** ISO-8601 UTC timestamp when the bucket resets (e.g. rate-limit window). */
  resetAt: string;
}

// ---------------------------------------------------------------------------
// Cost tracking
// ---------------------------------------------------------------------------

/** Aggregated cost figures for a provider + model combination. */
export interface CostInfo {
  /** Spend accumulated today (UTC), in USD. */
  today: number;
  /** Spend accumulated this calendar month (UTC), in USD. */
  thisMonth: number;
  /** User-configured monthly budget ceiling, in USD (`null` = no budget). */
  budget: number | null;
}

// ---------------------------------------------------------------------------
// NormalizedQuota — the single source-of-truth for the dashboard
// ---------------------------------------------------------------------------

/**
 * Unified quota snapshot for one provider + model combination.
 *
 * Every `ProviderAdapter.parseHeaders()` and `ProviderAdapter.fetchUsage()`
 * call ultimately produces (or partially fills) one of these objects.
 */
export interface NormalizedQuota {
  /** Provider identifier (e.g. `"openai"`, `"anthropic"`). */
  provider: string;
  /** Model identifier (e.g. `"gpt-4o"`, `"claude-sonnet-4-20250514"`). */
  model: string;
  /** Subscription tier for this key / org. */
  tier: Tier;

  /** Input (prompt) token quota bucket. */
  inputTokens: QuotaBucket;
  /** Output (completion) token quota bucket. */
  outputTokens: QuotaBucket;
  /** Request-count quota bucket. */
  requests: QuotaBucket;

  /** Cost tracking data. */
  cost: CostInfo;

  /** Computed health status. */
  status: QuotaStatus;

  /** ISO-8601 timestamp of when this snapshot was captured. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// ProviderAdapter — the Adapter Design Pattern contract
// ---------------------------------------------------------------------------

/**
 * Each LLM provider implements this interface.
 *
 * `parseHeaders` is the hot path — called on every proxied response to
 * extract rate-limit / quota data from HTTP headers.
 *
 * `fetchUsage` is the cold path — called periodically to pull full
 * account-level usage from the provider's billing / usage API.
 */
export interface ProviderAdapter {
  /** Unique machine-readable provider id (e.g. `"openai"`). */
  readonly name: string;

  /** Human-readable display name (e.g. `"OpenAI"`). */
  readonly displayName: string;

  /** Models this adapter knows how to handle. */
  readonly supportedModels: string[];

  /**
   * Extract quota information from HTTP response headers.
   *
   * @param headers — Lowercased header key → value map from the proxied
   *   API response.
   * @returns A partial `NormalizedQuota` containing only the fields that
   *   could be derived from headers (typically `requests` and token buckets).
   */
  parseHeaders(headers: Record<string, string>): Partial<NormalizedQuota>;

  /**
   * Fetch full account-level usage from the provider's billing / usage API.
   *
   * @param apiKey — The user's API key (BYOK). Never persisted.
   * @returns A complete `NormalizedQuota` snapshot.
   */
  fetchUsage(apiKey: string): Promise<NormalizedQuota>;
}

// ---------------------------------------------------------------------------
// ProviderConfig — user-persisted settings per provider
// ---------------------------------------------------------------------------

/** Per-provider configuration stored locally (never sent upstream). */
export interface ProviderConfig {
  /** Provider id matching `ProviderAdapter.name`. */
  providerId: string;
  /** Whether this provider is enabled in the dashboard. */
  enabled: boolean;
  /** Monthly budget ceiling in USD (`null` = unlimited). */
  budget: number | null;
  /** Optional list of model ids to monitor (empty = all supported). */
  models: string[];
}

// ---------------------------------------------------------------------------
// ProviderMeta — static display metadata
// ---------------------------------------------------------------------------

/**
 * Static metadata used by the UI to render provider cards, icons, and links.
 */
export interface ProviderMeta {
  /** Machine-readable provider id. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Lucide icon name (e.g. `"brain"`, `"sparkles"`). */
  icon: string;
  /** HSL color string for charts and badges (e.g. `"142 71% 45%"`). */
  color: string;
  /** One-line description of the provider. */
  description: string;
  /** URL to the provider's API docs. */
  docsUrl: string;
  /** Common prefix for this provider's rate-limit headers. */
  headerPrefix: string;
}

// ---------------------------------------------------------------------------
// Chart Data Types
// ---------------------------------------------------------------------------

export type ProviderId = "openai" | "anthropic" | "gemini" | "groq" | "mistral";

export type CostDataPoint = {
  date: string;
} & Partial<Record<ProviderId, number>>;

// ---------------------------------------------------------------------------
// Velocity Alerts
// ---------------------------------------------------------------------------

export interface VelocityEvent {
  type: "warning" | "critical" | "info";
  provider: ProviderId;
  message: string;
}
