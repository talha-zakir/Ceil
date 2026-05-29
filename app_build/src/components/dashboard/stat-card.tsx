"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    direction: "up" | "down";
    value: string;
    isPositive?: boolean; // up can be bad for costs
  };
  accentColor?: string; // HSL value
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  accentColor,
  className,
}: StatCardProps) {
  const trendColor = trend
    ? trend.isPositive
      ? "hsl(152, 68%, 52%)"
      : "hsl(0, 84%, 60%)"
    : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.06]",
        "p-4 cursor-default",
        "transition-colors duration-300",
        "hover:border-white/[0.12] hover:bg-white/[0.05]",
        className
      )}
    >
      {/* Subtle accent glow on hover */}
      {accentColor && (
        <div
          className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
          style={{ backgroundColor: `hsl(${accentColor})` }}
        />
      )}

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          {/* Icon + Label */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                backgroundColor: accentColor
                  ? `hsl(${accentColor} / 0.1)`
                  : "hsl(var(--bg-elevated))",
              }}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={{
                  color: accentColor ? `hsl(${accentColor})` : "hsl(var(--text-tertiary))",
                }}
              />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
              {label}
            </span>
          </div>

          {/* Value */}
          <p className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
            {value}
          </p>
        </div>

        {/* Trend */}
        {trend && (
          <div
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color: trendColor,
              backgroundColor: `${trendColor}15`,
            }}
          >
            <span className="text-xs">{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
