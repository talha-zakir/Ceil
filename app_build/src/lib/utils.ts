// =============================================================================
// Utility Helpers
// =============================================================================
// Shared formatting and class-name utilities used across the dashboard.
// =============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ---------------------------------------------------------------------------
// Class-name helper (clsx + tailwind-merge)
// ---------------------------------------------------------------------------

/**
 * Merge Tailwind CSS classes with conflict resolution.
 *
 * Combines `clsx` (conditional class building) with `tailwind-merge`
 * (intelligent deduplication of Tailwind utilities).
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-emerald-500", "px-6")
 * // → "py-2 px-6 bg-emerald-500"  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

/**
 * Format a raw token count into a human-readable abbreviated string.
 *
 * @example
 * formatTokens(0)          // → "0"
 * formatTokens(999)        // → "999"
 * formatTokens(1_200)      // → "1.2K"
 * formatTokens(45_000)     // → "45K"
 * formatTokens(1_234_567)  // → "1.2M"
 * formatTokens(2_500_000_000) // → "2.5B"
 */
export function formatTokens(n: number): string {
  if (n === Infinity) return "∞";
  if (n < 0) return `-${formatTokens(-n)}`;

  const abs = Math.abs(n);

  if (abs < 1_000) return abs.toString();
  if (abs < 1_000_000) {
    const v = abs / 1_000;
    return `${v >= 100 ? Math.round(v) : parseFloat(v.toFixed(1))}K`;
  }
  if (abs < 1_000_000_000) {
    const v = abs / 1_000_000;
    return `${v >= 100 ? Math.round(v) : parseFloat(v.toFixed(1))}M`;
  }
  const v = abs / 1_000_000_000;
  return `${v >= 100 ? Math.round(v) : parseFloat(v.toFixed(1))}B`;
}

/**
 * Format a USD cost value with a dollar sign and two decimal places.
 *
 * @example
 * formatCost(0)       // → "$0.00"
 * formatCost(12.3)    // → "$12.30"
 * formatCost(1234.56) // → "$1,234.56"
 */
export function formatCost(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a duration in seconds into a human-readable string.
 *
 * @example
 * formatDuration(0)     // → "0s"
 * formatDuration(45)    // → "45s"
 * formatDuration(154)   // → "2m 34s"
 * formatDuration(3661)  // → "1h 1m 1s"
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
}

/**
 * Format a used/total pair as a percentage string.
 *
 * @example
 * formatPercentage(67, 100)   // → "67%"
 * formatPercentage(1, 3)      // → "33%"
 * formatPercentage(0, 0)      // → "0%"
 * formatPercentage(5, 0)      // → "100%"  (treat zero-total as fully used)
 */
export function formatPercentage(used: number, total: number): string {
  if (total <= 0) return used > 0 ? "100%" : "0%";
  const pct = Math.round((used / total) * 100);
  return `${Math.min(pct, 100)}%`;
}

/**
 * Calculate the percentage of used/total as a number [0, 100].
 */
export function percentOf(used: number, total: number): number {
  if (total <= 0) return used > 0 ? 100 : 0;
  return Math.min((used / total) * 100, 100);
}

/**
 * Basic number formatting helper
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// ---------------------------------------------------------------------------
// Quota status helpers
// ---------------------------------------------------------------------------

/**
 * Derive a `QuotaStatus` from a remaining/limit ratio.
 *
 * - `>= 50%` remaining → `"healthy"`
 * - `>= 20%` remaining → `"warning"`
 * - `>  0%`  remaining → `"critical"`
 * - `== 0`   remaining → `"exhausted"`
 */
export function deriveQuotaStatus(
  remaining: number,
  limit: number,
): "healthy" | "warning" | "critical" | "exhausted" {
  if (limit <= 0 || remaining <= 0) return "exhausted";
  const ratio = remaining / limit;
  if (ratio >= 0.5) return "healthy";
  if (ratio >= 0.2) return "warning";
  return "critical";
}
