// =============================================================================
// Provider Constants & Metadata
// =============================================================================
// Static display metadata for every supported LLM provider.
// Colors are HSL strings optimised for dark-mode-first premium aesthetics.
// =============================================================================

import type { ProviderMeta } from "@/lib/providers/types";

// ---------------------------------------------------------------------------
// Provider Metadata Registry
// ---------------------------------------------------------------------------

/**
 * Immutable registry of provider display metadata.
 *
 * Keyed by provider id. Used by the UI for rendering cards, charts, badges,
 * and navigation items. Colors are intentionally high-saturation HSL values
 * that pop against dark backgrounds (Linear / Vercel aesthetic).
 */
export const PROVIDERS: Record<string, ProviderMeta> = {
  // -------------------------------------------------------------------------
  // OpenAI — Emerald Green
  // -------------------------------------------------------------------------
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "brain",
    color: "142 71% 45%",
    description: "GPT-4o, GPT-4.1, o3, and DALL·E models",
    docsUrl: "https://platform.openai.com/docs/api-reference",
    headerPrefix: "x-ratelimit-",
  },

  // -------------------------------------------------------------------------
  // Anthropic — Warm Amber / Orange
  // -------------------------------------------------------------------------
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    icon: "sparkles",
    color: "25 95% 53%",
    description: "Claude Sonnet, Opus, and Haiku models",
    docsUrl: "https://docs.anthropic.com/en/api",
    headerPrefix: "anthropic-ratelimit-",
  },

  // -------------------------------------------------------------------------
  // Google Gemini — Blue / Purple
  // -------------------------------------------------------------------------
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    icon: "hexagon",
    color: "250 85% 60%",
    description: "Gemini 2.5 Pro, Flash, and Nano models",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    headerPrefix: "x-ratelimit-",
  },

  // -------------------------------------------------------------------------
  // Groq — Electric Cyan
  // -------------------------------------------------------------------------
  groq: {
    id: "groq",
    name: "Groq",
    icon: "zap",
    color: "185 100% 50%",
    description: "Ultra-fast LPU inference for Llama, Mixtral, and Gemma",
    docsUrl: "https://console.groq.com/docs",
    headerPrefix: "x-ratelimit-",
  },

  // -------------------------------------------------------------------------
  // Mistral — Rose / Pink
  // -------------------------------------------------------------------------
  mistral: {
    id: "mistral",
    name: "Mistral AI",
    icon: "wind",
    color: "340 82% 60%",
    description: "Mistral Large, Medium, Small, and Codestral models",
    docsUrl: "https://docs.mistral.ai/api/",
    headerPrefix: "x-ratelimit-",
  },
} as const;

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** Ordered array of all provider ids. */
export const PROVIDER_IDS = Object.keys(PROVIDERS) as Array<
  keyof typeof PROVIDERS
>;

/** Ordered array of all provider meta objects. */
export const PROVIDER_LIST: ProviderMeta[] = Object.values(PROVIDERS);

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------

/** Default polling interval for usage fetches (ms). */
export const DEFAULT_POLL_INTERVAL_MS = 60_000;

/** Default monthly budget ceiling when none is configured (USD). */
export const DEFAULT_BUDGET_USD: number | null = null;

/** Percentage thresholds for quota status derivation. */
export const QUOTA_THRESHOLDS = {
  /** Below this ratio → "warning". */
  warning: 0.5,
  /** Below this ratio → "critical". */
  critical: 0.2,
} as const;
