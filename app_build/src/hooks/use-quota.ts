"use client";

import { useState, useEffect, useCallback } from "react";
import type { NormalizedQuota } from "@/lib/providers/types";
import { generateAllMockQuotas } from "@/lib/mock/generator";
import { DEFAULT_POLL_INTERVAL_MS } from "@/lib/constants";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface UseQuotaReturn {
  quotas: NormalizedQuota[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuota(): UseQuotaReturn {
  const [quotas, setQuotas] = useState<NormalizedQuota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotas = useCallback(() => {
    try {
      // Fetch initial mock data or fallback if Tauri fails
      const data = generateAllMockQuotas();
      setQuotas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quota data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotas();
    let unlisten: UnlistenFn | null = null;

    async function setupTauriListener() {
      try {
        if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
          unlisten = await listen<NormalizedQuota>("rate-limit-updated", (event) => {
            setQuotas((prev) => {
              const newQuota = event.payload;
              const existing = prev.findIndex((q) => q.provider === newQuota.provider);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = newQuota;
                return updated;
              }
              return [...prev, newQuota];
            });
          });
        }
      } catch (err) {
        console.warn("Tauri event listener failed to attach", err);
      }
    }

    setupTauriListener();

    // Fallback polling for when not running in Tauri (e.g. web dev server)
    const interval = setInterval(() => {
      if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) {
        fetchQuotas();
      }
    }, DEFAULT_POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (unlisten) {
        unlisten();
      }
    };
  }, [fetchQuotas]);

  return { quotas, isLoading, error, refetch: fetchQuotas };
}

export default useQuota;
