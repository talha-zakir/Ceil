"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostDataPoint, ProviderId } from "@/lib/providers/types";
import { generateMockCostHistory } from "@/lib/mock/generator";

type Period = "7d" | "14d" | "30d";

const PERIOD_DAYS: Record<Period, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
};

interface UseCostHistoryReturn {
  data: CostDataPoint[];
  period: Period;
  setPeriod: (period: Period) => void;
  isLoading: boolean;
}

interface Transaction {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
}

export function useCostHistory(initialPeriod: Period = "7d"): UseCostHistoryReturn {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<CostDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ceil_demo_mode");
      if (saved !== null) {
        return JSON.parse(saved);
      }
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      return !isTauri;
    }
    return true;
  });

  const fetchData = useCallback((p: Period, isDemo: boolean) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        const days = PERIOD_DAYS[p];
        const mockData = generateMockCostHistory(days);
        setData(mockData);
      } else {
        const days = PERIOD_DAYS[p];
        const savedTx = localStorage.getItem("ceil_transactions");
        const transactions: Transaction[] = savedTx ? JSON.parse(savedTx) : [];
        const now = new Date();

        // Create empty templates for the last N days
        const dataMap: Record<string, Record<ProviderId, number>> = {};
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          dataMap[dateStr] = {
            openai: 0,
            anthropic: 0,
            gemini: 0,
            groq: 0,
            mistral: 0,
          };
        }

        // Aggregate actual transaction logs
        transactions.forEach((tx) => {
          const txDate = tx.timestamp.split("T")[0];
          if (dataMap[txDate]) {
            const provider = tx.provider.toLowerCase() as ProviderId;
            if (dataMap[txDate][provider] !== undefined) {
              dataMap[txDate][provider] += tx.cost;
            }
          }
        });

        // Convert map back to list of data points
        const chartData: CostDataPoint[] = Object.entries(dataMap).map(([date, providers]) => ({
          date,
          ...providers,
        }));

        setData(chartData);
      }
    } catch (err) {
      console.error("Failed to parse cost history", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Demo Mode updates
  useEffect(() => {
    const handleDemoModeChange = () => {
      const saved = localStorage.getItem("ceil_demo_mode");
      if (saved !== null) {
        const newDemo = JSON.parse(saved);
        setDemoMode(newDemo);
        fetchData(period, newDemo);
      }
    };
    window.addEventListener("ceil-demo-mode-changed", handleDemoModeChange);
    return () => {
      window.removeEventListener("ceil-demo-mode-changed", handleDemoModeChange);
    };
  }, [period, fetchData]);

  useEffect(() => {
    fetchData(period, demoMode);
  }, [period, demoMode, fetchData]);

  return { data, period, setPeriod, isLoading };
}

export default useCostHistory;
