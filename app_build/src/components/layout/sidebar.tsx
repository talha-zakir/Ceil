"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Bot,
  Cpu,
  Zap,
  Wind,
  Flame,
} from "lucide-react";
import type { NormalizedQuota } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/constants";

interface SidebarProps {
  providers: NormalizedQuota[];
  collapsed: boolean;
  onToggle: () => void;
}

const providerIcons: Record<string, React.ElementType> = {
  openai: Sparkles,
  anthropic: Bot,
  gemini: Cpu,
  groq: Zap,
  mistral: Wind,
};

const statusColors: Record<string, string> = {
  healthy: "var(--color-healthy)",
  warning: "var(--color-warning)",
  critical: "var(--color-critical)",
  exhausted: "var(--color-exhausted)",
};

export function Sidebar({ providers, collapsed, onToggle }: SidebarProps) {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  // Deduplicate by provider ID to ensure we only render one button per unique provider in the sidebar
  const uniqueProviders = providers.filter(
    (p, index, self) => self.findIndex((t) => t.provider === p.provider) === index
  );

  return (
    <motion.aside
      className="relative flex flex-col h-full shrink-0 z-10"
      style={{
        background: "hsl(var(--bg-primary))",
        borderRight: "1px solid hsl(var(--border-subtle))",
      }}
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-14 z-20 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
        style={{
          background: "hsl(var(--bg-tertiary))",
          border: "1px solid hsl(var(--border-default))",
          color: "hsl(var(--text-tertiary))",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsl(var(--bg-hover))";
          e.currentTarget.style.color = "hsl(var(--text-primary))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
          e.currentTarget.style.color = "hsl(var(--text-tertiary))";
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Header */}
      <div
        className="flex items-center h-12 px-4 shrink-0"
        style={{ borderBottom: "1px solid hsl(var(--border-subtle))" }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "hsl(var(--text-muted))" }}
            >
              Providers
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Provider List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {uniqueProviders.map((provider) => {
          const meta = PROVIDERS[provider.provider];
          const Icon = providerIcons[provider.provider] || Sparkles;
          const isActive = activeProvider === provider.provider;
          const statusColor = statusColors[provider.status] || statusColors.healthy;

          return (
            <button
              key={provider.provider}
              onClick={() => setActiveProvider(provider.provider)}
              className="relative w-full flex items-center gap-3 rounded-lg transition-colors group"
              style={{
                padding: collapsed ? "8px" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive
                  ? "hsl(var(--bg-tertiary))"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "hsl(var(--bg-secondary))";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Provider Icon */}
              <div
                className="relative flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                style={{
                  background: `hsl(${meta?.color || "0 0% 50%"} / 0.12)`,
                }}
              >
                <Icon
                  size={16}
                  style={{ color: `hsl(${meta?.color || "0 0% 50%"})` }}
                />
                {/* Status Dot */}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: `hsl(${statusColor})`,
                    border: "2px solid hsl(var(--bg-primary))",
                  }}
                />
              </div>

              {/* Provider Name */}
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-start min-w-0"
                  >
                    <span
                      className="text-sm font-medium truncate"
                      style={{
                        color: isActive
                          ? "hsl(var(--text-primary))"
                          : "hsl(var(--text-secondary))",
                      }}
                    >
                      {meta?.name || provider.provider}
                    </span>
                    <span
                      className="text-[10px] truncate"
                      style={{ color: "hsl(var(--text-muted))" }}
                    >
                      {provider.model || "All models"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Add Provider Button */}
      <div
        className="shrink-0 p-2"
        style={{ borderTop: "1px solid hsl(var(--border-subtle))" }}
      >
        <button
          className="w-full flex items-center gap-2 rounded-lg text-sm transition-colors"
          style={{
            padding: collapsed ? "8px" : "8px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "hsl(var(--text-tertiary))",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--bg-secondary))";
            e.currentTarget.style.color = "hsl(var(--text-secondary))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "hsl(var(--text-tertiary))";
          }}
        >
          <Plus size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Add Provider
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
