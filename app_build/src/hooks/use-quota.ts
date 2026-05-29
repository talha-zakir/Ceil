"use client";

import { useState, useEffect, useCallback } from "react";
import type { NormalizedQuota } from "@/lib/providers/types";
import { generateAllMockQuotas } from "@/lib/mock/generator";
import { DEFAULT_POLL_INTERVAL_MS } from "@/lib/constants";

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
      // In development, use mock data
      // In production, this would call the Tauri backend / proxy
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

    const interval = setInterval(() => {
      fetchQuotas();
    }, DEFAULT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchQuotas]);

  return { quotas, isLoading, error, refetch: fetchQuotas };
}

export default useQuota;
