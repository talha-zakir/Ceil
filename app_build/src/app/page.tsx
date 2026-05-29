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
  AlertTriangle,
  Play,
  Terminal,
  ShieldAlert,
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
  const [proxyOnline, setProxyOnline] = useState<boolean | null>(null);

  // Auto-detect Tauri shell to bypass landing page and perform local proxy pings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        setShowDashboard(true);
      }
    }

    const checkProxyStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        // Ping local proxy loopback
        await fetch("http://localhost:9999/", {
          method: "GET",
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        setProxyOnline(true);
      } catch (e) {
        setProxyOnline(false);
      }
    };

    checkProxyStatus();
    const interval = setInterval(checkProxyStatus, 8000);
    return () => clearInterval(interval);
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
        className="min-h-screen w-screen overflow-x-hidden flex flex-col text-slate-100 selection:bg-cyan-500/30 selection:text-white select-none font-sans"
        style={{ background: "radial-gradient(ellipse at top, hsl(230, 25%, 8%) 0%, hsl(230, 30%, 3%) 100%)" }}
      >
        {/* Navigation Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto w-full border-b border-white/[0.03] backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Ceil</span>
          </div>

          <div className="flex items-center gap-5">
            {proxyOnline === true ? (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Proxy Connected
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Local Client Offline
              </span>
            )}
            <button 
              onClick={() => setShowDashboard(true)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Web Demo Sandbox
            </button>
            <a 
              href="https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe" 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] hover:border-white/[0.15] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Download size={13} />
              <span>Download Client</span>
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-20 lg:py-28 space-y-8 relative">
          {/* Neon background blurs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[350px] h-[180px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wide shadow-sm"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Zero-Leak API Cost Guard & Optimization</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl leading-[1.08] text-white"
          >
            Stop Overpaying for LLMs. <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 bg-clip-text text-transparent">Lock Down Quotas Locally.</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed"
          >
            Ceil is an elite local proxy and native desktop shell designed for indie developers. 
            Inject secrets dynamically from your OS Keychain, monitor rate-limit windows in real-time, 
            and instantly block rogue api loops before they rack up thousands in costs.
          </motion.p>

          {/* 2 Primary CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4 max-w-lg mx-auto"
          >
            {/* CTA 1: Web Dashboard Console */}
            <button
              onClick={() => setShowDashboard(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg hover:shadow-cyan-400/25 shadow-cyan-400/10 cursor-pointer duration-200 border border-cyan-300/30 group"
            >
              <Play size={14} className="fill-black group-hover:scale-110 transition-transform" />
              <span>{proxyOnline === true ? "Enter Live Console" : "Launch Web Demo Sandbox"}</span>
            </button>

            {/* CTA 2: Download Client */}
            <a
              href="https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold text-slate-200 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.16] hover:text-white transition-all cursor-pointer shadow-md duration-200"
            >
              <Download size={14} />
              <span>Download Desktop App</span>
            </a>
          </motion.div>

          {/* Proxy status prompt mechanism directly in Landing Page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="w-full max-w-lg mx-auto text-xs"
          >
            {proxyOnline === true ? (
              <p className="text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 py-2.5 px-4 rounded-xl">
                ⚡ <strong>Ceil Local Client is active!</strong> Entering the sandbox will automatically hook into your local developer rate limits and proxy server.
              </p>
            ) : (
              <p className="text-amber-400/80 bg-amber-500/5 border border-amber-500/10 py-2.5 px-4 rounded-xl leading-relaxed">
                🔌 <strong>Local Proxy not detected.</strong> If you don't have it running, entering the sandbox will showcase Ceil's interface with realistic demo data.
              </p>
            )}
          </motion.div>

          {/* Proxy visual schema */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-16 w-full max-w-3xl"
          >
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-6 md:gap-4">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.03] w-48 text-center shadow-inner">
                <Terminal size={20} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">Developer Script</span>
                <span className="text-[10px] text-slate-500">api_key="sk-placeholder"</span>
              </div>
              <div className="text-cyan-400 animate-pulse text-xs">➡️</div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 w-52 text-center shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                <Lock size={20} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">Ceil Local Proxy</span>
                <span className="text-[9px] text-cyan-400 font-mono">Swaps placeholder on-the-fly</span>
              </div>
              <div className="text-indigo-400 animate-pulse text-xs">➡️</div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.03] w-48 text-center shadow-inner">
                <Layers size={20} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Upstream LLM</span>
                <span className="text-[10px] text-slate-500">HTTPS (OpenAI, Gemini...)</span>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <section className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock size={18} className="text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">OS Keychain Key Injection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Keep secrets off files and Vercel. Keys store natively in macOS Keychain or Windows Credential Manager and inject on-the-fly locally.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap size={18} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">Smart Auto-Failover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Automatically fall back to alternative models or providers when primary keys return a rate-limit (429) block.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp size={18} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">"What-If" Routing Trade-offs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Graph accuracy versus cost compromises. Optimize routing rules by comparing coding benchmarks (HumanEval) and pricing tiers.</p>
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
            {/* Banner prompting user if local proxy is offline on dashboard */}
            {proxyOnline === false && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>
                    <strong>Ceil Proxy Offline:</strong> Launch the desktop application to establish a secure loopback connection and monitor actual API calls. Running in <strong>Demo Mode</strong>.
                  </span>
                </div>
                <a
                  href="https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe"
                  className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Download size={12} />
                  <span>Download Desktop App</span>
                </a>
              </motion.div>
            )}

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
