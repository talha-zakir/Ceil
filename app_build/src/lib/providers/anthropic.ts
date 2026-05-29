// =============================================================================
// Anthropic Provider Adapter
// =============================================================================
// Parses Anthropic's rate-limit response headers and fetches usage data.
//
// Header schema (as of 2025):
//   anthropic-ratelimit-requests-limit       — Max requests per minute
//   anthropic-ratelimit-requests-remaining    — Remaining requests this minute
//   anthropic-ratelimit-requests-reset        — ISO-8601 reset timestamp
//   anthropic-ratelimit-tokens-limit          — Max tokens per minute
//   anthropic-ratelimit-tokens-remaining      — Remaining tokens this minute
//   anthropic-ratelimit-tokens-reset          — ISO-8601 reset timestamp
//   anthropic-ratelimit-input-tokens-limit    — Max input tokens per minute
//   anthropic-ratelimit-input-tokens-remaining— Remaining input tokens
//   anthropic-ratelimit-input-tokens-reset    — ISO-8601 reset timestamp
//   anthropic-ratelimit-output-tokens-limit   — Max output tokens per minute
//   anthropic-ratelimit-output-tokens-remaining— Remaining output tokens
//   anthropic-ratelimit-output-tokens-reset   — ISO-8601 reset timestamp
//   retry-after                               — Seconds to wait (on 429)
//
// Anthropic is the most detailed provider — it splits input and output
// token buckets in headers, letting us fully populate NormalizedQuota.
// =============================================================================

import type {
  NormalizedQuota,
  ProviderAdapter,
  QuotaBucket,
} from "@/lib/providers/types";
import { deriveQuotaStatus } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function int(headers: Record<string, string>, key: string): number {
  const v = headers[key];
  if (v === undefined || v === "") return 0;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
}

function str(headers: Record<string, string>, key: string): string {
  return headers[key] ?? new Date().toISOString();
}

function emptyBucket(): QuotaBucket {
  return { used: 0, limit: 0, remaining: 0, resetAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const anthropicAdapter: ProviderAdapter = {
  name: "anthropic",
  displayName: "Anthropic",

  supportedModels: [
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "claude-3.5-sonnet-20241022",
    "claude-3.5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307",
  ],

  // -------------------------------------------------------------------------
  // parseHeaders
  // -------------------------------------------------------------------------

  parseHeaders(headers: Record<string, string>): Partial<NormalizedQuota> {
    // --- Requests bucket ---
    const reqLimit = int(headers, "anthropic-ratelimit-requests-limit");
    const reqRemaining = int(headers, "anthropic-ratelimit-requests-remaining");
    const reqReset = str(headers, "anthropic-ratelimit-requests-reset");

    const requests: QuotaBucket = {
      used: reqLimit - reqRemaining,
      limit: reqLimit,
      remaining: reqRemaining,
      resetAt: reqReset,
    };

    // --- Input tokens bucket ---
    const inLimit = int(headers, "anthropic-ratelimit-input-tokens-limit");
    const inRemaining = int(
      headers,
      "anthropic-ratelimit-input-tokens-remaining",
    );
    const inReset = str(headers, "anthropic-ratelimit-input-tokens-reset");

    const inputTokens: QuotaBucket = {
      used: inLimit - inRemaining,
      limit: inLimit,
      remaining: inRemaining,
      resetAt: inReset,
    };

    // --- Output tokens bucket ---
    const outLimit = int(headers, "anthropic-ratelimit-output-tokens-limit");
    const outRemaining = int(
      headers,
      "anthropic-ratelimit-output-tokens-remaining",
    );
    const outReset = str(headers, "anthropic-ratelimit-output-tokens-reset");

    const outputTokens: QuotaBucket = {
      used: outLimit - outRemaining,
      limit: outLimit,
      remaining: outRemaining,
      resetAt: outReset,
    };

    // Derive worst-case status across all three buckets
    const ratios = [
      reqLimit > 0 ? reqRemaining / reqLimit : 1,
      inLimit > 0 ? inRemaining / inLimit : 1,
      outLimit > 0 ? outRemaining / outLimit : 1,
    ];
    const worstRatio = Math.min(...ratios);

    return {
      provider: "anthropic",
      requests,
      inputTokens,
      outputTokens,
      status: deriveQuotaStatus(Math.round(worstRatio * 100), 100),
      timestamp: new Date().toISOString(),
    };
  },

  // -------------------------------------------------------------------------
  // fetchUsage
  // -------------------------------------------------------------------------

  async fetchUsage(apiKey: string): Promise<NormalizedQuota> {
    // Anthropic doesn't expose a public usage/billing API as of 2025.
    // We perform a lightweight /v1/messages call and extract headers.
    // In production the proxy layer captures these headers automatically.

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API returned ${response.status}: ${response.statusText}`,
      );
    }

    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key.toLowerCase()] = value;
    });

    const partial = this.parseHeaders(headerMap);

    return {
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      tier: "paid",
      inputTokens: partial.inputTokens ?? emptyBucket(),
      outputTokens: partial.outputTokens ?? emptyBucket(),
      requests: partial.requests ?? emptyBucket(),
      cost: { today: 0, thisMonth: 0, budget: null },
      status: partial.status ?? "healthy",
      timestamp: new Date().toISOString(),
    };
  },
};
