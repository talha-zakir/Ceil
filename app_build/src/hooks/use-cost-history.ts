"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostDataPoint } from "@/lib/providers/types";
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

export function useCostHistory(initialPeriod: Period = "7d"): UseCostHistoryReturn {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<CostDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback((p: Period) => {
    setIsLoading(true);
    try {
      // In production, fetch from backend API
      const days = PERIOD_DAYS[p];
      const mockData = generateMockCostHistory(days);
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  return { data, period, setPeriod, isLoading };
}

export default useCostHistory;
