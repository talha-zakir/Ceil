"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCost } from "@/lib/utils";
import { QuotaBar } from "@/components/dashboard/quota-bar";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";
import type { NormalizedQuota } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/constants";

interface ProviderCardProps {
  data: NormalizedQuota;
  className?: string;
}

const STATUS_BADGE: Record<
  NormalizedQuota["status"],
  { label: string; dotColor: string; bgColor: string }
> = {
  healthy: {
    label: "Healthy",
    dotColor: "hsl(var(--color-healthy))",
    bgColor: "hsl(var(--color-healthy) / 0.1)",
  },
  warning: {
    label: "Warning",
    dotColor: "hsl(var(--color-warning))",
    bgColor: "hsl(var(--color-warning) / 0.1)",
  },
  critical: {
    label: "Critical",
    dotColor: "hsl(var(--color-critical))",
    bgColor: "hsl(var(--color-critical) / 0.1)",
  },
  exhausted: {
    label: "Exhausted",
    dotColor: "hsl(var(--color-exhausted))",
    bgColor: "hsl(var(--color-exhausted) / 0.1)",
  },
};

export function ProviderCard({ data, className }: ProviderCardProps) {
  const provider = PROVIDERS[data.provider] || { name: data.provider, color: "0 0% 50%", icon: "circle" };
  const status = data.status;
  const quotas = [
    { label: "Requests", used: data.requests.used, limit: data.requests.limit, unit: "req" },
    { label: "Input Tokens", used: data.inputTokens.used, limit: data.inputTokens.limit, unit: "tok" },
    { label: "Output Tokens", used: data.outputTokens.used, limit: data.outputTokens.limit, unit: "tok" },
  ];
  const costToday = data.cost.today;
  const costMonth = data.cost.thisMonth;
  const resetAt = new Date(data.requests.resetAt || new Date().toISOString());
  const isConnected = true;
  const badge = STATUS_BADGE[status];

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.06]",
        "p-4 space-y-3",
        "transition-all duration-300",
        "hover:border-white/[0.12] hover:bg-white/[0.05]",
        className
      )}
    >
      {/* Provider accent glow on hover */}
      <div
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.08]"
        style={{ backgroundColor: `hsl(${provider.color})` }}
      />

      {/* Header: Provider Name + Status */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Provider Icon */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold"
            style={{
              backgroundColor: `hsl(${provider.color} / 0.12)`,
              color: `hsl(${provider.color})`,
            }}
          >
            {provider.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              {provider.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isConnected ? (
                <Wifi className="h-2.5 w-2.5 text-[hsl(var(--color-healthy))]" />
              ) : (
                <WifiOff className="h-2.5 w-2.5 text-[hsl(var(--color-exhausted))]" />
              )}
              <span className="text-[10px] text-[hsl(var(--text-muted))]">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ backgroundColor: badge.bgColor }}
        >
          <div
            className={cn("h-1.5 w-1.5 rounded-full", status === "critical" && "pulse-critical")}
            style={{ backgroundColor: badge.dotColor }}
          />
          <span className="text-[10px] font-semibold" style={{ color: badge.dotColor }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Quota Bars */}
      <div className="relative space-y-2.5">
        {quotas.map((q) => (
          <QuotaBar
            key={q.label}
            label={q.label}
            used={q.used}
            limit={q.limit}
            unit={q.unit}
            accentColor={provider.color}
          />
        ))}
      </div>

      {/* Footer: Cost + Countdown */}
      <div className="relative flex items-center justify-between border-t border-white/[0.04] pt-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-[hsl(var(--text-muted))]" />
            <span className="text-[11px] text-[hsl(var(--text-tertiary))]">Today</span>
            <span className="text-xs font-mono font-semibold text-[hsl(var(--text-primary))]">
              {formatCost(costToday)}
            </span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[hsl(var(--text-tertiary))]">Month</span>
            <span className="text-xs font-mono font-semibold text-[hsl(var(--text-secondary))]">
              {formatCost(costMonth)}
            </span>
          </div>
        </div>

        <CountdownTimer resetAt={resetAt} compact />
      </div>
    </motion.div>
  );
}

export default ProviderCard;
