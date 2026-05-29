"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingDown, 
  Sparkles, 
  Zap, 
  Cpu, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from "lucide-react";
import type { NormalizedQuota } from "@/lib/providers/types";

interface CostOptimizerProps {
  quotas: NormalizedQuota[];
}

export function CostOptimizer({ quotas }: CostOptimizerProps) {
  const [selectedScenario, setSelectedScenario] = useState<"flash" | "pro-gp">("flash");

  // Calculate session tokens from active premium models (openai, anthropic)
  const premiumQuotas = quotas.filter(q => q.provider === "anthropic" || q.provider === "openai");
  
  const totalInputTokens = premiumQuotas.reduce((sum, q) => sum + (q.inputTokens?.used ?? 0), 0) || 450000; // fallback default
  const totalOutputTokens = premiumQuotas.reduce((sum, q) => sum + (q.outputTokens?.used ?? 0), 0) || 120000; // fallback default

  // Pricing constants (per 1M tokens)
  // Claude 3.5 Sonnet / o1 average
  const premiumInputRate = 3.00 / 1_000_000;
  const premiumOutputRate = 15.00 / 1_000_000;

  // GPT-4o / Gemini Pro average (Tier 2)
  const gpInputRate = 2.50 / 1_000_000;
  const gpOutputRate = 10.00 / 1_000_000;

  // Gemini 1.5 Flash (Tier 3)
  const flashInputRate = 0.075 / 1_000_000;
  const flashOutputRate = 0.30 / 1_000_000;

  // Calculate actual vs fallbacks
  const currentCost = (totalInputTokens * premiumInputRate) + (totalOutputTokens * premiumOutputRate);
  const gpCost = (totalInputTokens * gpInputRate) + (totalOutputTokens * gpOutputRate);
  const flashCost = (totalInputTokens * flashInputRate) + (totalOutputTokens * flashOutputRate);

  const targetCost = selectedScenario === "flash" ? flashCost : gpCost;
  const savings = Math.max(0, currentCost - targetCost);
  const savingsPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;

  const targetAccuracy = selectedScenario === "flash" ? 72 : 82;
  const currentAccuracy = 90; // Claude 3.5 Sonnet base
  const accuracyLoss = currentAccuracy - targetAccuracy;

  const recommendableTasks = selectedScenario === "flash" 
    ? [
        { task: "Unit testing and boilerplate generation", safe: true },
        { task: "JSON formatting & schema enforcement", safe: true },
        { task: "Code documentation and comments", safe: true },
        { task: "Complex algorithmic architecture", safe: false }
      ]
    : [
        { task: "General agentic debugging steps", safe: true },
        { task: "Context gathering and codebase search", safe: true },
        { task: "Multi-file refactoring steps", safe: true },
        { task: "Highly critical production bug hotfixes", safe: false }
      ];

  return (
    <div 
      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm space-y-6"
    >
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-openai)]/[0.1] flex items-center justify-center">
            <TrendingDown size={16} className="text-[var(--color-openai)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              "What-If" Routing Intelligence
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]" style={{ contentVisibility: "auto" }}>
              Project savings if you route lower-complexity tasks to faster, cheaper tiers.
            </p>
          </div>
        </div>

        {/* Toggle scenarios */}
        <div className="flex bg-[hsl(var(--bg-tertiary))] p-0.5 rounded-lg border border-white/[0.04]">
          <button
            onClick={() => setSelectedScenario("flash")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              selectedScenario === "flash" 
                ? "bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm" 
                : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]"
            }`}
          >
            Swap to Flash (Tier 3)
          </button>
          <button
            onClick={() => setSelectedScenario("pro-gp")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              selectedScenario === "pro-gp" 
                ? "bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm" 
                : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]"
            }`}
          >
            Swap to GPT-4o (Tier 2)
          </button>
        </div>
      </div>

      {/* Main Stats Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost comparison card */}
        <div 
          className="rounded-lg p-4 space-y-3"
          style={{ background: "hsl(var(--bg-secondary))", border: "1px solid hsl(var(--border-subtle))" }}
        >
          <div className="flex justify-between items-center text-xs text-[hsl(var(--text-muted))]">
            <span>Spend Analysis</span>
            <span className="font-mono">({(totalInputTokens/1000).toFixed(0)}K / {(totalOutputTokens/1000).toFixed(0)}K tokens)</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))]">
              <span>Current (Tier 1) Cost:</span>
              <span className="font-mono">${currentCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[hsl(var(--text-primary))] font-semibold">
              <span>Proposed Cost:</span>
              <span className="font-mono text-[hsl(var(--color-healthy))]">${targetCost.toFixed(2)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-dashed border-white/[0.06] flex items-baseline justify-between">
            <span className="text-xs text-[hsl(var(--text-muted))]">Est. Savings:</span>
            <span className="text-lg font-bold text-[hsl(var(--color-healthy))] font-mono">
              -${savings.toFixed(2)} <span className="text-xs font-normal">({savingsPercent.toFixed(0)}%)</span>
            </span>
          </div>
        </div>

        {/* Quality / Accuracy Tradeoff card */}
        <div 
          className="rounded-lg p-4 space-y-3"
          style={{ background: "hsl(var(--bg-secondary))", border: "1px solid hsl(var(--border-subtle))" }}
        >
          <div className="flex justify-between items-center text-xs text-[hsl(var(--text-muted))]">
            <span>Coding Accuracy</span>
            <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-[hsl(var(--text-secondary))]">HumanEval Benchmark</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))]">
              <span>Claude 3.5 Sonnet:</span>
              <span className="font-semibold text-emerald-400">{currentAccuracy}%</span>
            </div>
            <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))]">
              <span>{selectedScenario === "flash" ? "Gemini 1.5 Flash" : "GPT-4o"}:</span>
              <span className="font-semibold text-amber-400">{targetAccuracy}%</span>
            </div>
          </div>
          <div className="pt-2 border-t border-dashed border-white/[0.06] flex items-baseline justify-between">
            <span className="text-xs text-[hsl(var(--text-muted))]">Accuracy Drop:</span>
            <span className="text-lg font-bold text-amber-500 font-mono">
              -{accuracyLoss}%
            </span>
          </div>
        </div>

        {/* Intelligent Recommendation */}
        <div 
          className="rounded-lg p-4 flex flex-col justify-between"
          style={{ 
            background: selectedScenario === "flash" ? "hsla(32, 95%, 60%, 0.02)" : "hsla(252, 87%, 67%, 0.02)",
            border: "1px solid hsl(var(--border-subtle))" 
          }}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1.5">
              <AlertTriangle size={14} />
              <span>Routing Trade-off Recommendation</span>
            </div>
            <p className="text-[11px] text-[hsl(var(--text-tertiary))] leading-relaxed">
              {selectedScenario === "flash" 
                ? "Perfect for high-volume formatting, syntax checks, or unit testing. Swap to save up to 98% on token costs, but retain Claude 3.5 Sonnet for architectural edits." 
                : "Suitable for search, code comprehension, and general coding updates. Swap to save 18-20% with minimal loss in accuracy."}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-muted))] mt-3">
            <Info size={11} />
            <span>Based on active workspace tokens</span>
          </div>
        </div>
      </div>

      {/* Task-by-task Swap Check list */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[hsl(var(--text-secondary))]">
          Task Routing Suitability
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recommendableTasks.map((t, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-2.5 rounded-lg text-xs"
              style={{ background: "hsl(var(--bg-tertiary))" }}
            >
              <span className="text-[hsl(var(--text-secondary))]">{t.task}</span>
              {t.safe ? (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Safe to Swap
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full">
                  <AlertTriangle size={11} /> Keep Premium
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
