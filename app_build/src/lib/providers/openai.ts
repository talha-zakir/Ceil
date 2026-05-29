// =============================================================================
// OpenAI Provider Adapter
// =============================================================================
// Parses OpenAI's rate-limit response headers and fetches account-level usage
// from the OpenAI Usage API.
//
// Header schema (as of 2025):
//   x-ratelimit-limit-requests        — Max requests per window
//   x-ratelimit-limit-tokens           — Max tokens per window
//   x-ratelimit-remaining-requests     — Remaining requests in window
//   x-ratelimit-remaining-tokens       — Remaining tokens in window
//   x-ratelimit-reset-requests         — Time until request bucket resets
//   x-ratelimit-reset-tokens           — Time until token bucket resets
//
// OpenAI does NOT split input/output tokens in headers; we map the single
// "tokens" bucket to `inputTokens` and leave `outputTokens` partially filled.
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

/** Parse a header value as an integer, returning 0 when missing / invalid. */
function int(headers: Record<string, string>, key: string): number {
  const v = headers[key];
  if (v === undefined || v === "") return 0;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Parse OpenAI's duration format (e.g. `"6m30s"`, `"200ms"`, `"1h"`)
 * into an ISO-8601 reset timestamp relative to now.
 */
function parseResetDuration(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();

  let totalMs = 0;
  const hours = raw.match(/(\d+)h/);
  const mins = raw.match(/(\d+)m(?!s)/);
  const secs = raw.match(/(\d+)s/);
  const ms = raw.match(/(\d+)ms/);

  if (hours) totalMs += parseInt(hours[1], 10) * 3_600_000;
  if (mins) totalMs += parseInt(mins[1], 10) * 60_000;
  if (secs) totalMs += parseInt(secs[1], 10) * 1_000;
  if (ms) totalMs += parseInt(ms[1], 10);

  return new Date(Date.now() + totalMs).toISOString();
}

/** Build an empty quota bucket. */
function emptyBucket(): QuotaBucket {
  return { used: 0, limit: 0, remaining: 0, resetAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const openaiAdapter: ProviderAdapter = {
  name: "openai",
  displayName: "OpenAI",

  supportedModels: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o3",
    "o3-mini",
    "o4-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ],

  // -------------------------------------------------------------------------
  // parseHeaders
  // -------------------------------------------------------------------------

  parseHeaders(headers: Record<string, string>): Partial<NormalizedQuota> {
    const limitRequests = int(headers, "x-ratelimit-limit-requests");
    const limitTokens = int(headers, "x-ratelimit-limit-tokens");
    const remainingRequests = int(headers, "x-ratelimit-remaining-requests");
    const remainingTokens = int(headers, "x-ratelimit-remaining-tokens");
    const resetRequests = parseResetDuration(
      headers["x-ratelimit-reset-requests"],
    );
    const resetTokens = parseResetDuration(
      headers["x-ratelimit-reset-tokens"],
    );

    const requests: QuotaBucket = {
      used: limitRequests - remainingRequests,
      limit: limitRequests,
      remaining: remainingRequests,
      resetAt: resetRequests,
    };

    // OpenAI merges input + output into a single "tokens" bucket.
    const inputTokens: QuotaBucket = {
      used: limitTokens - remainingTokens,
      limit: limitTokens,
      remaining: remainingTokens,
      resetAt: resetTokens,
    };

    const remaining = Math.min(
      remainingRequests / (limitRequests || 1),
      remainingTokens / (limitTokens || 1),
    );

    return {
      provider: "openai",
      requests,
      inputTokens,
      outputTokens: emptyBucket(),
      status: deriveQuotaStatus(
        Math.round(remaining * 100),
        100,
      ),
      timestamp: new Date().toISOString(),
    };
  },

  // -------------------------------------------------------------------------
  // fetchUsage
  // -------------------------------------------------------------------------

  async fetchUsage(apiKey: string): Promise<NormalizedQuota> {
    // In production this would call:
    //   GET https://api.openai.com/v1/organization/usage/completions
    //   Authorization: Bearer <apiKey>
    //
    // For now, we throw a descriptive error so consumers know this is a stub.
    // The mock layer should be used during development.

    const response = await fetch(
      "https://api.openai.com/v1/organization/usage/completions?limit=1",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `OpenAI usage API returned ${response.status}: ${response.statusText}`,
      );
    }

    // Parse headers from the response itself for rate-limit info
    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key.toLowerCase()] = value;
    });

    const partial = this.parseHeaders(headerMap);

    return {
      provider: "openai",
      model: "gpt-4o",
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
