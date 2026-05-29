"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatNumber, percentOf } from "@/lib/utils";

interface QuotaBarProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  accentColor?: string; // HSL values, e.g. "152 68% 52%"
  className?: string;
}

function getProgressColor(percentage: number): string {
  if (percentage < 60) return "152 68% 52%";   // Green
  if (percentage < 80) return "45 93% 58%";     // Yellow
  if (percentage < 95) return "32 95% 60%";     // Orange
  return "0 84% 60%";                           // Red
}

export function QuotaBar({
  label,
  used,
  limit,
  unit = "tokens",
  accentColor,
  className,
}: QuotaBarProps) {
  const percentage = percentOf(used, limit);
  const progressColor = accentColor || getProgressColor(percentage);
  const isExhausted = percentage >= 95;

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: `hsl(${progressColor})` }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-[hsl(var(--text-secondary))]">
            {formatNumber(used)} / {formatNumber(limit)}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-full",
              isExhausted ? "pulse-critical" : ""
            )}
            style={{
              color: `hsl(${progressColor})`,
              backgroundColor: `hsl(${progressColor} / 0.12)`,
            }}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative h-2 w-full rounded-full overflow-hidden bg-white/[0.04] backdrop-blur-sm">
        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />

        {/* Animated Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 20,
            mass: 0.8,
          }}
          style={{
            background: `linear-gradient(90deg, hsl(${progressColor} / 0.7), hsl(${progressColor}))`,
            boxShadow: `0 0 12px hsl(${progressColor} / 0.3), 0 0 4px hsl(${progressColor} / 0.2)`,
          }}
        />

        {/* Glass highlight on top */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent" />
      </div>
    </div>
  );
}

export default QuotaBar;
