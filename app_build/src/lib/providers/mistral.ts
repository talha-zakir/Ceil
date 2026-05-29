// =============================================================================
// Mistral AI Provider Adapter
// =============================================================================
// Parses Mistral's rate-limit response headers and fetches usage data.
//
// Header schema (as of 2025):
//   x-ratelimit-limit-requests         — Max requests per window
//   x-ratelimit-remaining-requests     — Remaining requests
//   x-ratelimit-reset-requests         — ISO-8601 timestamp for request reset
//   x-ratelimit-limit-tokens           — Max tokens per window
//   x-ratelimit-remaining-tokens       — Remaining tokens
//   x-ratelimit-reset-tokens           — ISO-8601 timestamp for token reset
//
// Mistral follows a similar pattern to Groq/OpenAI for rate-limit headers.
// They also offer a /v1/usage endpoint for billing data (workspace-level).
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

function timestamp(
  headers: Record<string, string>,
  key: string,
): string {
  const v = headers[key];
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function emptyBucket(): QuotaBucket {
  return { used: 0, limit: 0, remaining: 0, resetAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const mistralAdapter: ProviderAdapter = {
  name: "mistral",
  displayName: "Mistral AI",

  supportedModels: [
    "mistral-medium-3.5",
    "mistral-small-4",
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "codestral-latest",
    "open-mistral-nemo",
    "open-mixtral-8x22b",
    "mistral-embed",
  ],

  // -------------------------------------------------------------------------
  // parseHeaders
  // -------------------------------------------------------------------------

  parseHeaders(headers: Record<string, string>): Partial<NormalizedQuota> {
    const reqLimit = int(headers, "x-ratelimit-limit-requests");
    const reqRemaining = int(headers, "x-ratelimit-remaining-requests");
    const reqReset = timestamp(headers, "x-ratelimit-reset-requests");

    const tokLimit = int(headers, "x-ratelimit-limit-tokens");
    const tokRemaining = int(headers, "x-ratelimit-remaining-tokens");
    const tokReset = timestamp(headers, "x-ratelimit-reset-tokens");

    const requests: QuotaBucket = {
      used: reqLimit - reqRemaining,
      limit: reqLimit,
      remaining: reqRemaining,
      resetAt: reqReset,
    };

    const inputTokens: QuotaBucket = {
      used: tokLimit - tokRemaining,
      limit: tokLimit,
      remaining: tokRemaining,
      resetAt: tokReset,
    };

    const worstRatio = Math.min(
      reqLimit > 0 ? reqRemaining / reqLimit : 1,
      tokLimit > 0 ? tokRemaining / tokLimit : 1,
    );

    return {
      provider: "mistral",
      requests,
      inputTokens,
      outputTokens: emptyBucket(),
      status: deriveQuotaStatus(Math.round(worstRatio * 100), 100),
      timestamp: new Date().toISOString(),
    };
  },

  // -------------------------------------------------------------------------
  // fetchUsage
  // -------------------------------------------------------------------------

  async fetchUsage(apiKey: string): Promise<NormalizedQuota> {
    // Mistral offers a workspace-level usage endpoint.
    // We probe the chat completions endpoint to harvest rate-limit headers.

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-small-4",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Mistral API returned ${response.status}: ${response.statusText}`,
      );
    }

    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key.toLowerCase()] = value;
    });

    const partial = this.parseHeaders(headerMap);

    return {
      provider: "mistral",
      model: "mistral-small-4",
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
