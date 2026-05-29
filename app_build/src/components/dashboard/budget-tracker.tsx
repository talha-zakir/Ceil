"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCost } from "@/lib/utils";

interface BudgetTrackerProps {
  spent: number;
  limit: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getBudgetColor(percentage: number): string {
  if (percentage < 50) return "152 68% 52%";   // Green
  if (percentage < 75) return "45 93% 58%";     // Yellow
  if (percentage < 90) return "32 95% 60%";     // Orange
  return "0 84% 60%";                           // Red
}

export function BudgetTracker({
  spent,
  limit,
  label = "Monthly Budget",
  size = 140,
  strokeWidth = 8,
  className,
}: BudgetTrackerProps) {
  const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const budgetColor = getBudgetColor(percentage);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const center = size / 2;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Label */}
      <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
        {label}
      </span>

      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(224, 12%, 14%)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`hsl(${budgetColor})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 15,
              mass: 1,
            }}
            style={{
              filter: `drop-shadow(0 0 6px hsl(${budgetColor} / 0.4))`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tracking-tight text-[hsl(var(--text-primary))]">
            {formatCost(spent)}
          </span>
          <span className="text-[11px] text-[hsl(var(--text-muted))]">
            of {formatCost(limit)}
          </span>
        </div>
      </div>

      {/* Percentage badge */}
      <div
        className="rounded-full px-3 py-1"
        style={{
          color: `hsl(${budgetColor})`,
          backgroundColor: `hsl(${budgetColor} / 0.1)`,
        }}
      >
        <span className="text-xs font-semibold font-mono">{percentage.toFixed(1)}% used</span>
      </div>
    </div>
  );
}

export default BudgetTracker;
