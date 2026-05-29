"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProviderCard } from "@/components/dashboard/provider-card";
import { ProviderGrid } from "@/components/dashboard/provider-grid";
import { StatCard } from "@/components/dashboard/stat-card";
import { CostChart } from "@/components/dashboard/cost-chart";
import { BudgetTracker } from "@/components/dashboard/budget-tracker";
import { VelocityAlert } from "@/components/dashboard/velocity-alert";
import { CostOptimizer } from "@/components/dashboard/cost-optimizer";
import { useQuota } from "@/hooks/use-quota";
import { useCostHistory } from "@/hooks/use-cost-history";

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function DashboardPage() {
  const { quotas, isLoading } = useQuota();
  const { data: costData, period, setPeriod } = useCostHistory();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Aggregate stats from all providers
  const totalSpendToday = quotas.reduce(
    (sum, q) => sum + (q.cost?.today ?? 0),
    0
  );
  const totalSpendMonth = quotas.reduce(
    (sum, q) => sum + (q.cost?.thisMonth ?? 0),
    0
  );
  const totalBudget = quotas.reduce(
    (sum, q) => sum + (q.cost?.budget ?? 0),
    0
  );
  const activeProviders = quotas.filter(
    (q) => q.status !== "exhausted"
  ).length;
  const criticalProviders = quotas.filter(
    (q) => q.status === "critical" || q.status === "exhausted"
  ).length;
  const totalTokensToday = quotas.reduce(
    (sum, q) =>
      sum + (q.inputTokens?.used ?? 0) + (q.outputTokens?.used ?? 0),
    0
  );

  const overallStatus =
    criticalProviders > 0
      ? "critical"
      : quotas.some((q) => q.status === "warning")
        ? "warning"
        : "healthy";

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        providers={quotas}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header status={overallStatus} />

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1400px] mx-auto space-y-6"
          >
            {/* Velocity Alert Banner */}
            <VelocityAlert />

            {/* Top Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard
                icon={DollarSign}
                label="Today's Spend"
                value={`$${totalSpendToday.toFixed(2)}`}
                trend={{ direction: "up", value: "12.5%", isPositive: false }}
                accentColor="var(--color-openai)"
              />
              <StatCard
                icon={TrendingUp}
                label="Monthly Spend"
                value={`$${totalSpendMonth.toFixed(2)}`}
                trend={{ direction: "up", value: `$${totalBudget.toFixed(0)} budget`, isPositive: true }}
                accentColor="var(--color-anthropic)"
              />
              <StatCard
                icon={Activity}
                label="Active Providers"
                value={`${activeProviders}`}
                trend={{ direction: criticalProviders > 0 ? "down" : "up", value: criticalProviders > 0 ? `${criticalProviders} need attention` : "All healthy", isPositive: criticalProviders === 0 }}
                accentColor="var(--color-gemini)"
              />
              <StatCard
                icon={Zap}
                label="Tokens Today"
                value={formatCompactNumber(totalTokensToday)}
                trend={{ direction: "down", value: "5.2%", isPositive: true }}
                accentColor="var(--color-groq)"
              />
            </motion.div>

            {/* Cost Chart + Budget Tracker Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <div className="lg:col-span-2">
                <CostChart
                  data={costData}
                />
              </div>
              <div>
                <BudgetTracker
                  spent={totalSpendMonth}
                  limit={totalBudget}
                />
              </div>
            </motion.div>

            {/* "What-If" Routing Intelligence Widget */}
            <motion.div variants={itemVariants}>
              <CostOptimizer quotas={quotas} />
            </motion.div>

            {/* Provider Cards Grid */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium" style={{ color: "hsl(var(--text-secondary))" }}>
                  Provider Status
                </h2>
                <button
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--text-tertiary))" }}
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <ProviderGrid>
                {quotas.map((quota) => (
                  <ProviderCard key={`${quota.provider}-${quota.model}`} data={quota} />
                ))}
              </ProviderGrid>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function formatCompactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
