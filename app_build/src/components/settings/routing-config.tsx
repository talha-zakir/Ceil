"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { 
  Zap, 
  Check, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
  Bot,
  Cpu,
  ShieldAlert,
  Coins
} from "lucide-react";

const PROVIDERS = [
  { id: "openai", name: "OpenAI (GPT-4o)", color: "var(--color-openai)", icon: Sparkles },
  { id: "anthropic", name: "Anthropic (Claude)", color: "var(--color-anthropic)", icon: Bot },
  { id: "gemini", name: "Google Gemini", color: "var(--color-gemini)", icon: Cpu }
];

const BENCHMARKS = [
  { 
    tier: "Tier 1: Deep Reasoning", 
    models: "Claude 3.5 Sonnet / o1", 
    accuracy: 90, 
    cost: "$$$", 
    accuracyColor: "hsl(var(--color-healthy))",
    icon: Bot
  },
  { 
    tier: "Tier 2: General Purpose", 
    models: "Gemini 1.5 Pro / GPT-4o", 
    accuracy: 82, 
    cost: "$$", 
    accuracyColor: "hsl(var(--color-warning))",
    icon: Cpu
  },
  { 
    tier: "Tier 3: Fast & Formatting", 
    models: "Gemini 1.5 Flash / GPT-4o Mini", 
    accuracy: 72, 
    cost: "$", 
    accuracyColor: "hsl(var(--color-critical))",
    icon: Zap
  }
];

export function RoutingConfig() {
  const [failoverEnabled, setFailoverEnabled] = useState(false);
  const [fallbacks, setFallbacks] = useState<Record<string, string>>({
    openai: "anthropic",
    anthropic: "gemini",
    gemini: "openai"
  });
  
  // New budget and loop protection states
  const [dailySpendLimit, setDailySpendLimit] = useState(10.0);
  const [rogueLoopProtection, setRogueLoopProtection] = useState(false);
  const [maxRequestsPerMinute, setMaxRequestsPerMinute] = useState(60);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFailover = localStorage.getItem("routing_failover_enabled") === "true";
      const savedRules = localStorage.getItem("routing_fallback_rules");
      const savedLimit = localStorage.getItem("routing_daily_spend_limit");
      const savedLoop = localStorage.getItem("routing_rogue_loop_protection") === "true";
      const savedMaxReq = localStorage.getItem("routing_max_requests_per_minute");
      
      setFailoverEnabled(savedFailover);
      setRogueLoopProtection(savedLoop);
      if (savedRules) {
        try { setFallbacks(JSON.parse(savedRules)); } catch (e) {}
      }
      if (savedLimit) setDailySpendLimit(Number(savedLimit));
      if (savedMaxReq) setMaxRequestsPerMinute(Number(savedMaxReq));
      
      // Sync initial state with Rust proxy if Tauri is available
      if ((window as any).__TAURI_INTERNALS__) {
        invoke("update_proxy_config", { 
          config: {
            failoverEnabled: savedFailover, 
            fallbackRules: savedRules ? JSON.parse(savedRules) : fallbacks,
            dailySpendLimit: savedLimit ? Number(savedLimit) : 10.0,
            rogueLoopProtection: savedLoop,
            maxRequestsPerMinute: savedMaxReq ? Number(savedMaxReq) : 60
          }
        }).catch(err => console.error("Failed to sync initial proxy config:", err));
      }
    }
  }, []);

  const syncConfig = async (
    failover: boolean,
    rules: Record<string, string>,
    limit: number,
    loop: boolean,
    maxReq: number
  ) => {
    setSaveStatus("saving");
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      try {
        await invoke("update_proxy_config", { 
          config: {
            failoverEnabled: failover, 
            fallbackRules: rules,
            dailySpendLimit: limit,
            rogueLoopProtection: loop,
            maxRequestsPerMinute: maxReq
          }
        });
      } catch (err) {
        console.error("Failed to sync proxy configuration to Rust:", err);
      }
    }
    setTimeout(() => setSaveStatus("saved"), 500);
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleToggleFailover = (checked: boolean) => {
    setFailoverEnabled(checked);
    localStorage.setItem("routing_failover_enabled", String(checked));
    syncConfig(checked, fallbacks, dailySpendLimit, rogueLoopProtection, maxRequestsPerMinute);
  };

  const handleFallbackChange = (providerId: string, fallbackId: string) => {
    const updated = { ...fallbacks, [providerId]: fallbackId };
    setFallbacks(updated);
    localStorage.setItem("routing_fallback_rules", JSON.stringify(updated));
    syncConfig(failoverEnabled, updated, dailySpendLimit, rogueLoopProtection, maxRequestsPerMinute);
  };

  const handleLimitChange = (val: number) => {
    setDailySpendLimit(val);
    localStorage.setItem("routing_daily_spend_limit", String(val));
    syncConfig(failoverEnabled, fallbacks, val, rogueLoopProtection, maxRequestsPerMinute);
  };

  const handleToggleLoop = (checked: boolean) => {
    setRogueLoopProtection(checked);
    localStorage.setItem("routing_rogue_loop_protection", String(checked));
    syncConfig(failoverEnabled, fallbacks, dailySpendLimit, checked, maxRequestsPerMinute);
  };

  const handleMaxReqChange = (val: number) => {
    setMaxRequestsPerMinute(val);
    localStorage.setItem("routing_max_requests_per_minute", String(val));
    syncConfig(failoverEnabled, fallbacks, dailySpendLimit, rogueLoopProtection, val);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-muted))" }}>
          Routing & Cost Safety
        </h2>
        {saveStatus === "saving" && <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>Saving...</span>}
        {saveStatus === "saved" && (
          <span className="text-xs flex items-center gap-1 animate-pulse" style={{ color: "hsl(var(--color-healthy))" }}>
            <Check size={12} /> Sync Complete
          </span>
        )}
      </div>

      {/* Auto-Failover Switch */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-subtle))"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
              Smart Auto-Failover (Rate-Limit Protection)
            </h3>
            <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
              Automatically fall back to a backup model tier when your main API keys hit rate limits (429 errors).
            </p>
          </div>
          <button
            onClick={() => handleToggleFailover(!failoverEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0`}
            style={{
              background: failoverEnabled ? "hsl(var(--color-healthy))" : "hsl(var(--bg-tertiary))"
            }}
          >
            <motion.div
              layout
              className="bg-white w-4 h-4 rounded-full shadow-md"
              animate={{ x: failoverEnabled ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Fallback Mapping Setup */}
        {failoverEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 pt-6 border-t border-dashed space-y-4"
            style={{ borderTopColor: "hsl(var(--border-subtle))" }}
          >
            <div className="grid gap-3">
              {PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                return (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-3 rounded-lg text-sm"
                    style={{ background: "hsl(var(--bg-tertiary))" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} style={{ color: provider.color }} />
                      <span style={{ color: "hsl(var(--text-primary))" }}>If {provider.name} Fails:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowRight size={14} style={{ color: "hsl(var(--text-muted))" }} />
                      <select
                        value={fallbacks[provider.id]}
                        onChange={(e) => handleFallbackChange(provider.id, e.target.value)}
                        className="bg-transparent border rounded px-2 py-1 text-xs outline-none"
                        style={{ 
                          borderColor: "hsl(var(--border-subtle))",
                          color: "hsl(var(--text-secondary))",
                          background: "hsl(var(--bg-secondary))"
                        }}
                      >
                        {PROVIDERS.filter(p => p.id !== provider.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Budget Caps & Runaway Cost Protection */}
      <div
        className="rounded-xl p-5 space-y-5"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-subtle))"
        }}
      >
        <div className="flex items-start gap-3">
          <Coins size={18} style={{ color: "hsl(var(--color-openai))" }} className="mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
              Runaway Cost Protection (Budget Caps)
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--text-tertiary))" }}>
              Halt proxy calls instantly if daily spend or request velocity triggers.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: "hsl(var(--border-subtle))" }}>
          {/* Daily Spend Limit */}
          <div className="space-y-2">
            <label className="text-xs font-medium block" style={{ color: "hsl(var(--text-secondary))" }}>
              Daily Spend Limit ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "hsl(var(--text-muted))" }}>$</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={dailySpendLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-xs outline-none transition-colors"
                style={{
                  background: "hsl(var(--bg-root))",
                  border: "1px solid hsl(var(--border-default))",
                  color: "hsl(var(--text-primary))"
                }}
              />
            </div>
            <p className="text-[10px]" style={{ color: "hsl(var(--text-muted))" }}>
              Halt requests once daily cost exceeds limit (0 to disable).
            </p>
          </div>

          {/* Rogue Loop Switch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium block" style={{ color: "hsl(var(--text-secondary))" }}>
                Rogue Loop Protection
              </label>
              <button
                onClick={() => handleToggleLoop(!rogueLoopProtection)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out`}
                style={{
                  background: rogueLoopProtection ? "hsl(var(--color-healthy))" : "hsl(var(--bg-tertiary))"
                }}
              >
                <motion.div
                  layout
                  className="bg-white w-4 h-4 rounded-full shadow-md"
                  animate={{ x: rogueLoopProtection ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            {rogueLoopProtection ? (
              <div className="space-y-1">
                <input
                  type="number"
                  min={10}
                  max={200}
                  step={5}
                  value={maxRequestsPerMinute}
                  onChange={(e) => handleMaxReqChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors"
                  style={{
                    background: "hsl(var(--bg-root))",
                    border: "1px solid hsl(var(--border-default))",
                    color: "hsl(var(--text-primary))"
                  }}
                />
                <span className="text-[10px] block" style={{ color: "hsl(var(--text-muted))" }}>
                  Max allowed requests per minute.
                </span>
              </div>
            ) : (
              <p className="text-xs pt-1.5" style={{ color: "hsl(var(--text-muted))" }}>
                Velocity limit checking is disabled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tradeoff intelligence overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <TrendingDown size={16} style={{ color: "hsl(var(--color-openai))" }} />
          <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
            "What-If" Routing Intelligence Overview
          </h3>
        </div>
        <p className="text-xs px-1" style={{ color: "hsl(var(--text-tertiary))" }}>
          Ceil visualizes optimization recommendations based on the balance between model accuracy (benchmarked by HumanEval Coding Accuracy) and API costs.
        </p>

        <div className="grid gap-3 mt-4">
          {BENCHMARKS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.tier}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: "hsl(var(--bg-secondary))",
                  border: "1px solid hsl(var(--border-subtle))"
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "hsl(var(--bg-tertiary))" }}
                  >
                    <Icon size={16} style={{ color: "hsl(var(--text-secondary))" }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
                      {b.tier}
                    </h4>
                    <p className="text-[11px]" style={{ color: "hsl(var(--text-muted))" }}>
                      {b.models}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-right">
                  <div>
                    <span className="text-[10px] block" style={{ color: "hsl(var(--text-muted))" }}>
                      Accuracy
                    </span>
                    <span className="text-xs font-semibold" style={{ color: b.accuracyColor }}>
                      {b.accuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] block" style={{ color: "hsl(var(--text-muted))" }}>
                      Cost Tier
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "hsl(var(--text-secondary))" }}>
                      {b.cost}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
