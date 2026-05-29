"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronRight,
  Shield,
  Lock,
  Download,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle,
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
  const [showDashboard, setShowDashboard] = useState(false);

  // Auto-detect Tauri shell to bypass landing page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        setShowDashboard(true);
      }
    }
  }, []);

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

  if (!showDashboard) {
    return (
      <div 
        className="min-h-screen w-screen overflow-x-hidden flex flex-col text-slate-100 selection:bg-cyan-500/30 select-none"
        style={{ background: "radial-gradient(ellipse at top, hsl(230, 25%, 8%) 0%, hsl(230, 30%, 3%) 100%)" }}
      >
        {/* Navigation Header */}
        <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full border-b border-white/[0.04] backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Ceil</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDashboard(true)}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Demo Sandbox
            </button>
            <a 
              href="https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all cursor-pointer shadow-sm"
            >
              <Download size={13} />
              <span>Download</span>
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-20 lg:py-32 space-y-8 relative">
          {/* Neon background blurs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[150px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wide shadow-sm"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Privacy-First LLM Monitoring</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] text-white"
          >
            The Secure Local Firewall & <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 bg-clip-text text-transparent">Quota Optimizer</span> for LLMs
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            Route API calls through a local micro-proxy daemon. Keep API keys safely stored inside your operating system's native Keychain. Monitor usage in real-time, block rogue loops, and failover automatically.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4"
          >
            <button
              onClick={() => setShowDashboard(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-400/20 cursor-pointer"
            >
              <span>Explore Demo Console</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer shadow-md"
            >
              <Download size={16} />
              <span>Download Desktop Client</span>
            </a>
          </motion.div>

          {/* Proxy visual schema */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-16 w-full max-w-3xl"
          >
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-6 md:gap-4">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.03] w-48 text-center shadow-inner">
                <Cpu size={22} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">Your SDK / App</span>
                <span className="text-[10px] text-slate-500">Bearer sk-placeholder</span>
              </div>
              <div className="text-cyan-400 animate-pulse text-xs">➡️</div>
              <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 w-52 text-center shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                <Lock size={22} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">Ceil Local Proxy</span>
                <span className="text-[9px] text-cyan-400 font-mono">Injects real key from OS</span>
              </div>
              <div className="text-indigo-400 animate-pulse text-xs">➡️</div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.03] w-48 text-center shadow-inner">
                <Layers size={22} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Upstream API</span>
                <span className="text-[10px] text-slate-500">HTTPS (OpenAI, Gemini)</span>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <section className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <Lock size={18} className="text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">Zero-Leak Key Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Your actual LLM provider keys are stored natively in Windows Credential Manager or macOS Keychain, completely bypassing the cloud.</p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Zap size={18} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">Smart Auto-Failover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Automatically reroute calls to a backup provider when a key hits rate limits (429 status code), preventing project down-time.</p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                <TrendingUp size={18} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">What-If Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Calculate savings dynamically from session logs by analyzing accuracy and cost tradeoffs on lower model tiers.</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-10 text-center border-t border-white/[0.03] mt-20 text-[11px] text-slate-600">
          <p>© 2026 Ceil Dashboard. Privacy-first, local API monitors for developers.</p>
        </footer>
      </div>
    );
  }

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
