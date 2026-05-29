// =============================================================================
// Google Gemini Provider Adapter
// =============================================================================
// Parses Google Gemini (AI Studio / Vertex AI) rate-limit response headers
// and fetches usage data.
//
// Header schema (generativeai.googleapis.com — as of 2025):
//   x-ratelimit-limit             — Max requests per minute
//   x-ratelimit-remaining         — Remaining requests per minute
//   x-ratelimit-reset             — Seconds until window resets
//   x-ratelimit-limit-tokens      — Max tokens per minute  (when present)
//   x-ratelimit-remaining-tokens  — Remaining tokens        (when present)
//   x-ratelimit-reset-tokens      — Seconds until token window resets
//
// Google's headers are less granular than Anthropic's; we map what's
// available and leave gaps for the mock / polling layer to fill.
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

function resetFromSeconds(headers: Record<string, string>, key: string): string {
  const secs = int(headers, key);
  return new Date(Date.now() + secs * 1000).toISOString();
}

function emptyBucket(): QuotaBucket {
  return { used: 0, limit: 0, remaining: 0, resetAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const geminiAdapter: ProviderAdapter = {
  name: "gemini",
  displayName: "Google Gemini",

  supportedModels: [
    "gemini-3.5-flash",
    "gemini-3.1-pro",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ],

  // -------------------------------------------------------------------------
  // parseHeaders
  // -------------------------------------------------------------------------

  parseHeaders(headers: Record<string, string>): Partial<NormalizedQuota> {
    // --- Requests bucket ---
    const reqLimit = int(headers, "x-ratelimit-limit");
    const reqRemaining = int(headers, "x-ratelimit-remaining");
    const reqReset = resetFromSeconds(headers, "x-ratelimit-reset");

    const requests: QuotaBucket = {
      used: reqLimit - reqRemaining,
      limit: reqLimit,
      remaining: reqRemaining,
      resetAt: reqReset,
    };

    // --- Tokens bucket (combined input+output when available) ---
    const tokLimit = int(headers, "x-ratelimit-limit-tokens");
    const tokRemaining = int(headers, "x-ratelimit-remaining-tokens");
    const tokReset = resetFromSeconds(headers, "x-ratelimit-reset-tokens");

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
      provider: "gemini",
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
    // Google AI Studio doesn't expose a dedicated usage/billing API for
    // API-key auth. In Vertex AI, billing data comes from Cloud Billing APIs.
    // We probe the models endpoint to harvest rate-limit headers.

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "hi" }] }],
          generationConfig: { maxOutputTokens: 1 },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Gemini API returned ${response.status}: ${response.statusText}`,
      );
    }

    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key.toLowerCase()] = value;
    });

    const partial = this.parseHeaders(headerMap);

    return {
      provider: "gemini",
      model: "gemini-3.5-flash",
      tier: "free",
      inputTokens: partial.inputTokens ?? emptyBucket(),
      outputTokens: partial.outputTokens ?? emptyBucket(),
      requests: partial.requests ?? emptyBucket(),
      cost: { today: 0, thisMonth: 0, budget: null },
      status: partial.status ?? "healthy",
      timestamp: new Date().toISOString(),
    };
  },
};
