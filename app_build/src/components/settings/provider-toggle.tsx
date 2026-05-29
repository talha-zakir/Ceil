"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Cpu,
  Zap,
  Wind,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { PROVIDER_LIST } from "@/lib/constants";
import Link from "next/link";

const providerIcons: Record<string, React.ElementType> = {
  openai: Sparkles,
  anthropic: Bot,
  gemini: Cpu,
  groq: Zap,
  mistral: Wind,
};

export function ProviderToggle() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PROVIDER_LIST.forEach((p) => {
      initial[p.id] = true;
    });
    return initial;
  });

  // Simulate connection status (in production, this would come from keychain check)
  const [connected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PROVIDER_LIST.forEach((p, i) => {
      // Mock: first 3 providers are connected
      initial[p.id] = i < 3;
    });
    return initial;
  });

  const toggleProvider = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3">
      <p
        className="text-xs mb-4"
        style={{ color: "hsl(var(--text-tertiary))" }}
      >
        Enable or disable providers to control which APIs are monitored. Only
        enabled providers with valid API keys will be tracked.
      </p>

      {PROVIDER_LIST.map((provider) => {
        const Icon = providerIcons[provider.id] || Sparkles;
        const isEnabled = enabled[provider.id];
        const isConnected = connected[provider.id];

        return (
          <motion.div
            key={provider.id}
            className="flex items-center justify-between p-4 rounded-xl transition-opacity"
            style={{
              background: "hsl(var(--bg-secondary))",
              border: `1px solid hsl(${isEnabled ? "var(--border-default)" : "var(--border-subtle)"})`,
              opacity: isEnabled ? 1 : 0.5,
            }}
            layout
          >
            {/* Left: Icon + Info */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: `hsl(${provider.color} / ${isEnabled ? 0.12 : 0.05})`,
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: `hsl(${provider.color} / ${isEnabled ? 1 : 0.4})`,
                  }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "hsl(var(--text-primary))" }}
                >
                  {provider.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Connection Status */}
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <Check
                        size={10}
                        style={{ color: "hsl(var(--color-healthy))" }}
                      />
                    ) : (
                      <X
                        size={10}
                        style={{ color: "hsl(var(--text-muted))" }}
                      />
                    )}
                    <span
                      className="text-[11px]"
                      style={{
                        color: isConnected
                          ? "hsl(var(--color-healthy))"
                          : "hsl(var(--text-muted))",
                      }}
                    >
                      {isConnected ? "Key configured" : "No key"}
                    </span>
                  </div>

                  <span
                    className="text-[11px]"
                    style={{ color: "hsl(var(--text-muted))" }}
                  >
                    •
                  </span>

                  {/* Configure Link */}
                  <button
                    className="text-[11px] flex items-center gap-0.5 transition-colors"
                    style={{ color: `hsl(${provider.color} / 0.7)` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = `hsl(${provider.color})`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = `hsl(${provider.color} / 0.7)`;
                    }}
                  >
                    Configure <ExternalLink size={9} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Toggle */}
            <button
              onClick={() => toggleProvider(provider.id)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{
                background: isEnabled
                  ? `hsl(${provider.color})`
                  : "hsl(var(--bg-hover))",
              }}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                animate={{ left: isEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ProviderToggle;
