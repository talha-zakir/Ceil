// =============================================================================
// Adapter Factory & Registry
// =============================================================================
// Central registry for all provider adapters. Provides type-safe lookup by
// provider id and factory functions for creating adapter instances.
// =============================================================================

import type { ProviderAdapter } from "@/lib/providers/types";
import { openaiAdapter } from "@/lib/providers/openai";
import { anthropicAdapter } from "@/lib/providers/anthropic";
import { geminiAdapter } from "@/lib/providers/gemini";
import { groqAdapter } from "@/lib/providers/groq";
import { mistralAdapter } from "@/lib/providers/mistral";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Immutable map of provider id → adapter instance.
 *
 * Every adapter is a singleton — safe to share across the application.
 */
const adapterRegistry: ReadonlyMap<string, ProviderAdapter> = new Map<
  string,
  ProviderAdapter
>([
  ["openai", openaiAdapter],
  ["anthropic", anthropicAdapter],
  ["gemini", geminiAdapter],
  ["groq", groqAdapter],
  ["mistral", mistralAdapter],
]);

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Retrieve a provider adapter by its id.
 *
 * @throws {Error} if the provider id is not registered.
 *
 * @example
 * const adapter = getAdapter("openai");
 * const partial = adapter.parseHeaders(responseHeaders);
 */
export function getAdapter(providerId: string): ProviderAdapter {
  const adapter = adapterRegistry.get(providerId);
  if (!adapter) {
    throw new Error(
      `Unknown provider "${providerId}". ` +
        `Registered providers: ${[...adapterRegistry.keys()].join(", ")}`,
    );
  }
  return adapter;
}

/**
 * Retrieve a provider adapter by its id, returning `undefined` when the
 * provider is not registered (instead of throwing).
 */
export function getAdapterSafe(
  providerId: string,
): ProviderAdapter | undefined {
  return adapterRegistry.get(providerId);
}

/**
 * Return all registered adapter instances as an array.
 */
export function getAllAdapters(): ProviderAdapter[] {
  return [...adapterRegistry.values()];
}

/**
 * Return all registered provider ids as an array.
 */
export function getRegisteredProviderIds(): string[] {
  return [...adapterRegistry.keys()];
}

/**
 * Check whether a provider id is registered.
 */
export function isRegisteredProvider(providerId: string): boolean {
  return adapterRegistry.has(providerId);
}

/**
 * Find the adapter that supports a given model name.
 *
 * Returns the first matching adapter, or `undefined` if no adapter
 * claims the model.
 *
 * @example
 * const adapter = findAdapterForModel("gpt-4o");
 * // → openaiAdapter
 */
export function findAdapterForModel(
  modelId: string,
): ProviderAdapter | undefined {
  for (const adapter of adapterRegistry.values()) {
    if (adapter.supportedModels.includes(modelId)) {
      return adapter;
    }
  }
  return undefined;
}

/**
 * Parse response headers by auto-detecting the provider from known header
 * prefixes. Falls back to trying all adapters.
 *
 * @returns The parsed partial quota and the detected provider id, or `null`
 *   if no adapter could extract meaningful data.
 */
export function parseHeadersAutoDetect(
  headers: Record<string, string>,
): { providerId: string; data: ReturnType<ProviderAdapter["parseHeaders"]> } | null {
  const keys = Object.keys(headers).map((k) => k.toLowerCase());

  // Anthropic has a unique prefix — check first
  if (keys.some((k) => k.startsWith("anthropic-ratelimit-"))) {
    return {
      providerId: "anthropic",
      data: anthropicAdapter.parseHeaders(headers),
    };
  }

  // For OpenAI-compatible headers, try each adapter and return the first
  // that produces a non-empty result.
  for (const [id, adapter] of adapterRegistry) {
    const result = adapter.parseHeaders(headers);
    if (result.requests && result.requests.limit > 0) {
      return { providerId: id, data: result };
    }
  }

  return null;
}
