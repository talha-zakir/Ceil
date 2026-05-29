import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface PricingConfig {
  provider: string;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export function usePricing() {
  const [pricing, setPricing] = useState<PricingConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricingConfig() {
      if (!supabase) {
        setIsLoading(false);
        return; // Fallback to local constants if Supabase is not configured
      }

      try {
        const { data, error } = await supabase
          .from("provider_pricing")
          .select("*");

        if (error) throw error;
        
        // Map database columns to our interface
        const mappedData: PricingConfig[] = data.map((row: any) => ({
          provider: row.provider_id,
          costPer1kInput: Number(row.cost_input_1k),
          costPer1kOutput: Number(row.cost_output_1k),
        }));

        setPricing(mappedData);
      } catch (err) {
        console.error("Failed to fetch dynamic pricing config:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPricingConfig();
  }, []);

  return { pricing, isLoading, error };
}
