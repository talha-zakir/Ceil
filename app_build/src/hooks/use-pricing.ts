"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface PricingConfig {
  provider: string;
  costPer1kInput: number;
  costPer1kOutput: number;
}

const DEFAULT_PRICING: PricingConfig[] = [
  { provider: "openai", costPer1kInput: 0.0025, costPer1kOutput: 0.0100 },
  { provider: "anthropic", costPer1kInput: 0.0030, costPer1kOutput: 0.0150 },
  { provider: "gemini", costPer1kInput: 0.00007, costPer1kOutput: 0.00021 },
  { provider: "groq", costPer1kInput: 0.0001, costPer1kOutput: 0.0002 },
  { provider: "mistral", costPer1kInput: 0.0015, costPer1kOutput: 0.0045 }
];

export function usePricing() {
  const [pricing, setPricing] = useState<PricingConfig[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ceil_cached_pricing");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {
          // Fall through
        }
      }
    }
    return DEFAULT_PRICING;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricingConfig() {
      if (!supabase) {
        setIsLoading(false);
        return; 
      }

      try {
        const fetchPromise = supabase
          .from("provider_pricing")
          .select("*");
          
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 5000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;
        
        if (data && data.length > 0) {
          const mappedData: PricingConfig[] = data.map((row: any) => ({
            provider: row.provider_id,
            costPer1kInput: Number(row.cost_input_1k),
            costPer1kOutput: Number(row.cost_output_1k),
          }));

          if (typeof window !== "undefined") {
            localStorage.setItem("ceil_cached_pricing", JSON.stringify(mappedData));
          }
          setPricing(mappedData);
          setError(null);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic pricing config from Supabase, loading fallback/cache:", err);
        setError(err instanceof Error ? err.message : "Network error");
        
        // Try loading from localStorage if we haven't already
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("ceil_cached_pricing");
          if (cached) {
            try {
              setPricing(JSON.parse(cached));
            } catch (_) {
              // Stay with initial state
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPricingConfig();
  }, []);

  return { pricing, isLoading, error };
}

export default usePricing;
