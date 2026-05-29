"use client";

import { useState, useEffect, useCallback } from "react";
import type { NormalizedQuota, QuotaStatus } from "@/lib/providers/types";
import { generateAllMockQuotas } from "@/lib/mock/generator";
import { DEFAULT_POLL_INTERVAL_MS } from "@/lib/constants";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface UseQuotaReturn {
  quotas: NormalizedQuota[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const BASELINE_QUOTAS: NormalizedQuota[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    tier: "paid",
    inputTokens: { used: 0, limit: 2_000_000, remaining: 2_000_000, resetAt: new Date().toISOString() },
    outputTokens: { used: 0, limit: 800_000, remaining: 800_000, resetAt: new Date().toISOString() },
    requests: { used: 0, limit: 10_000, remaining: 10_000, resetAt: new Date().toISOString() },
    cost: { today: 0, thisMonth: 0, budget: 500 },
    status: "healthy",
    timestamp: new Date().toISOString(),
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    tier: "paid",
    inputTokens: { used: 0, limit: 1_000_000, remaining: 1_000_000, resetAt: new Date().toISOString() },
    outputTokens: { used: 0, limit: 400_000, remaining: 400_000, resetAt: new Date().toISOString() },
    requests: { used: 0, limit: 5_000, remaining: 5_000, resetAt: new Date().toISOString() },
    cost: { today: 0, thisMonth: 0, budget: 300 },
    status: "healthy",
    timestamp: new Date().toISOString(),
  },
  {
    provider: "gemini",
    model: "gemini-1.5-flash",
    tier: "free",
    inputTokens: { used: 0, limit: 15_000_000, remaining: 15_000_000, resetAt: new Date().toISOString() },
    outputTokens: { used: 0, limit: 4_000_000, remaining: 4_000_000, resetAt: new Date().toISOString() },
    requests: { used: 0, limit: 15_000, remaining: 15_000, resetAt: new Date().toISOString() },
    cost: { today: 0, thisMonth: 0, budget: null },
    status: "healthy",
    timestamp: new Date().toISOString(),
  },
  {
    provider: "groq",
    model: "llama-3-groq",
    tier: "free",
    inputTokens: { used: 0, limit: 5_000_000, remaining: 5_000_000, resetAt: new Date().toISOString() },
    outputTokens: { used: 0, limit: 2_000_000, remaining: 2_000_000, resetAt: new Date().toISOString() },
    requests: { used: 0, limit: 14_400, remaining: 14_400, resetAt: new Date().toISOString() },
    cost: { today: 0, thisMonth: 0, budget: null },
    status: "healthy",
    timestamp: new Date().toISOString(),
  },
  {
    provider: "mistral",
    model: "mistral-large",
    tier: "paid",
    inputTokens: { used: 0, limit: 2_000_000, remaining: 2_000_000, resetAt: new Date().toISOString() },
    outputTokens: { used: 0, limit: 1_000_000, remaining: 1_000_000, resetAt: new Date().toISOString() },
    requests: { used: 0, limit: 10_000, remaining: 10_000, resetAt: new Date().toISOString() },
    cost: { today: 0, thisMonth: 0, budget: 150 },
    status: "healthy",
    timestamp: new Date().toISOString(),
  }
];

function deriveStatus(remaining: number, limit: number): QuotaStatus {
  if (limit <= 0 || remaining <= 0) return "exhausted";
  const ratio = remaining / limit;
  if (ratio >= 0.5) return "healthy";
  if (ratio >= 0.2) return "warning";
  return "critical";
}

interface RateLimitPayload {
  provider: string;
  limit: string;
  remaining: string;
  reset: string;
}

interface RequestLoggedPayload {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export function useQuota(): UseQuotaReturn {
  const [demoMode, setDemoModeState] = useState<boolean>(true);
  const [quotas, setQuotas] = useState<NormalizedQuota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ceil_demo_mode");
      if (saved !== null) {
        setDemoModeState(JSON.parse(saved));
      } else {
        const isTauri = !!(window as any).__TAURI_INTERNALS__;
        setDemoModeState(!isTauri);
      }
    }
  }, []);

  const setDemoMode = useCallback((val: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ceil_demo_mode", JSON.stringify(val));
      setDemoModeState(val);
      window.dispatchEvent(new Event("ceil-demo-mode-changed"));
    }
  }, []);

  const loadRealQuotas = useCallback(() => {
    try {
      const saved = localStorage.getItem("ceil_quotas");
      if (saved) {
        setQuotas(JSON.parse(saved));
      } else {
        localStorage.setItem("ceil_quotas", JSON.stringify(BASELINE_QUOTAS));
        setQuotas(BASELINE_QUOTAS);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load local quota data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuotas = useCallback(() => {
    setIsLoading(true);
    if (demoMode) {
      try {
        const data = generateAllMockQuotas();
        setQuotas(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch mock quota data");
      } finally {
        setIsLoading(false);
      }
    } else {
      loadRealQuotas();
    }
  }, [demoMode, loadRealQuotas]);

  // Sync state with Demo Mode changes
  useEffect(() => {
    const handleDemoModeChange = () => {
      const saved = localStorage.getItem("ceil_demo_mode");
      if (saved !== null) {
        setDemoModeState(JSON.parse(saved));
      }
    };
    window.addEventListener("ceil-demo-mode-changed", handleDemoModeChange);
    return () => {
      window.removeEventListener("ceil-demo-mode-changed", handleDemoModeChange);
    };
  }, []);

  useEffect(() => {
    fetchQuotas();
  }, [demoMode, fetchQuotas]);

  // Setup Tauri Listeners for Real-time events
  useEffect(() => {
    if (demoMode) return;

    let unlistenRateLimit: UnlistenFn | null = null;
    let unlistenRequestLogged: UnlistenFn | null = null;

    async function setupTauriListeners() {
      try {
        if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
          // 1. Listen for rate limit updates from proxy headers
          unlistenRateLimit = await listen<RateLimitPayload>("rate-limit-updated", (event) => {
            const payload = event.payload;
            const providerId = payload.provider.toLowerCase();
            
            const limitVal = parseInt(payload.limit) || 0;
            const remainingVal = parseInt(payload.remaining) || 0;
            const usedVal = Math.max(0, limitVal - remainingVal);
            const resetSec = parseFloat(payload.reset.replace("s", "")) || 60;
            const resetAtVal = new Date(Date.now() + resetSec * 1000).toISOString();

            setQuotas((prev) => {
              const updated = prev.map((q) => {
                if (q.provider === providerId) {
                  const status = deriveStatus(remainingVal, limitVal || q.requests.limit);
                  return {
                    ...q,
                    requests: {
                      used: usedVal,
                      limit: limitVal || q.requests.limit,
                      remaining: remainingVal,
                      resetAt: resetAtVal,
                    },
                    status,
                    timestamp: new Date().toISOString(),
                  };
                }
                return q;
              });
              localStorage.setItem("ceil_quotas", JSON.stringify(updated));
              return updated;
            });
          });

          // 2. Listen for parsed token usage and costs
          unlistenRequestLogged = await listen<RequestLoggedPayload>("request-logged", (event) => {
            const payload = event.payload;
            const providerId = payload.provider.toLowerCase();

            // Save to transaction log in localStorage
            const savedTx = localStorage.getItem("ceil_transactions");
            const transactions = savedTx ? JSON.parse(savedTx) : [];
            const newTx = {
              provider: providerId,
              model: payload.model,
              inputTokens: payload.inputTokens,
              outputTokens: payload.outputTokens,
              cost: payload.cost,
              timestamp: new Date().toISOString(),
            };
            transactions.push(newTx);
            localStorage.setItem("ceil_transactions", JSON.stringify(transactions));

            // Update quotas
            setQuotas((prev) => {
              const updated = prev.map((q) => {
                if (q.provider === providerId) {
                  const inputUsed = q.inputTokens.used + payload.inputTokens;
                  const outputUsed = q.outputTokens.used + payload.outputTokens;
                  
                  return {
                    ...q,
                    inputTokens: {
                      ...q.inputTokens,
                      used: inputUsed,
                      remaining: Math.max(0, q.inputTokens.limit - inputUsed),
                    },
                    outputTokens: {
                      ...q.outputTokens,
                      used: outputUsed,
                      remaining: Math.max(0, q.outputTokens.limit - outputUsed),
                    },
                    cost: {
                      ...q.cost,
                      today: q.cost.today + payload.cost,
                      thisMonth: q.cost.thisMonth + payload.cost,
                    },
                    timestamp: new Date().toISOString(),
                  };
                }
                return q;
              });
              localStorage.setItem("ceil_quotas", JSON.stringify(updated));
              return updated;
            });
          });
        }
      } catch (err) {
        console.warn("Tauri event listeners failed to attach", err);
      }
    }

    setupTauriListeners();

    return () => {
      if (unlistenRateLimit) unlistenRateLimit();
      if (unlistenRequestLogged) unlistenRequestLogged();
    };
  }, [demoMode]);

  // Fallback polling for when not running in Tauri (e.g. web dev server)
  useEffect(() => {
    const interval = setInterval(() => {
      if (demoMode && (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__)) {
        fetchQuotas();
      }
    }, DEFAULT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [demoMode, fetchQuotas]);

  return { quotas, isLoading, error, refetch: fetchQuotas, demoMode, setDemoMode };
}

export default useQuota;
