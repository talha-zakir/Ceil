"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { 
  Zap, 
  HelpCircle, 
  Check, 
  TrendingDown, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Bot,
  Cpu
} from "lucide-react";

interface FallbackRule {
  provider: string;
  fallback: string;
}

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFailover = localStorage.getItem("routing_failover_enabled") === "true";
      const savedRules = localStorage.getItem("routing_fallback_rules");
      
      setFailoverEnabled(savedFailover);
      if (savedRules) {
        try {
          setFallbacks(JSON.parse(savedRules));
        } catch (e) {
          console.error("Failed to parse fallback rules", e);
        }
      }
      
      // Sync initial state with Rust proxy if Tauri is available
      if ((window as any).__TAURI_INTERNALS__) {
        invoke("update_proxy_config", { 
          failoverEnabled: savedFailover, 
          fallbackRules: savedRules ? JSON.parse(savedRules) : fallbacks 
        }).catch(err => console.error("Failed to sync initial proxy config:", err));
      }
    }
  }, []);

  const handleToggle = async (checked: boolean) => {
    setFailoverEnabled(checked);
    localStorage.setItem("routing_failover_enabled", String(checked));
    
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      try {
        await invoke("update_proxy_config", { 
          failoverEnabled: checked, 
          fallbackRules: fallbacks 
        });
      } catch (err) {
        console.error("Failed to sync proxy configuration to Rust:", err);
      }
    }
  };

  const handleFallbackChange = async (providerId: string, fallbackId: string) => {
    const updated = { ...fallbacks, [providerId]: fallbackId };
    setFallbacks(updated);
    localStorage.setItem("routing_fallback_rules", JSON.stringify(updated));
    setSaveStatus("saving");

    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      try {
        await invoke("update_proxy_config", { 
          failoverEnabled: failoverEnabled, 
          fallbackRules: updated 
        });
      } catch (err) {
        console.error("Failed to sync updated fallbacks to Rust:", err);
      }
    }
    
    setTimeout(() => setSaveStatus("saved"), 800);
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Auto-Failover Switch */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-subtle))"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
              Smart Auto-Failover (Rate-Limit Protection)
            </h3>
            <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
              Automatically fall back to a backup model tier when your main API keys hit rate limits (429 errors).
            </p>
          </div>
          <button
            onClick={() => handleToggle(!failoverEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out`}
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
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-muted))" }}>
                Fallback Mapping Rules
              </h4>
              {saveStatus === "saved" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--color-healthy))" }}>
                  <Check size={12} /> Sync Complete
                </span>
              )}
            </div>

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

      {/* Tradeoff intelligence overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} style={{ color: "hsl(var(--color-openai))" }} />
          <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
            "What-If" Routing Intelligence Overview
          </h3>
        </div>
        <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
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
