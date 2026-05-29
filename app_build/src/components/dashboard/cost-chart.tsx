"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { PROVIDERS } from "@/lib/constants";
import type { CostDataPoint, ProviderId } from "@/lib/providers/types";

interface CostChartProps {
  data: CostDataPoint[];
  className?: string;
  height?: number;
}

const PROVIDER_CHART_CONFIG: {
  key: ProviderId;
  color: string;
  name: string;
}[] = [
  { key: "openai", color: "hsl(152, 68%, 52%)", name: "OpenAI" },
  { key: "anthropic", color: "hsl(32, 95%, 60%)", name: "Anthropic" },
  { key: "gemini", color: "hsl(252, 87%, 67%)", name: "Gemini" },
  { key: "groq", color: "hsl(188, 95%, 55%)", name: "Groq" },
  { key: "mistral", color: "hsl(345, 82%, 65%)", name: "Mistral" },
];

/* Custom dark-themed tooltip */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[hsl(224,18%,7%)] px-3.5 py-2.5 shadow-2xl backdrop-blur-xl">
      <p className="mb-1.5 text-[11px] font-medium text-[hsl(var(--text-tertiary))]">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-[hsl(var(--text-secondary))]">
                {entry.name}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[hsl(var(--text-primary))]">
              ${entry.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 border-t border-white/[0.06] pt-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[hsl(var(--text-tertiary))]">Total</span>
          <span className="text-xs font-mono font-bold text-[hsl(var(--text-primary))]">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CostChart({ data, className, height = 240 }: CostChartProps) {
  // Generate unique gradient IDs to avoid conflicts when multiple charts render
  const gradientIds = useMemo(
    () =>
      PROVIDER_CHART_CONFIG.map((p) => ({
        ...p,
        gradientId: `gradient-${p.key}-${Math.random().toString(36).slice(2, 8)}`,
      })),
    []
  );

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm",
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {gradientIds.map(({ gradientId, color }) => (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(224, 12%, 16%)"
            strokeOpacity={0.4}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickFormatter={(value: number) => `$${value}`}
            width={50}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "hsl(220, 10%, 30%)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          {gradientIds.map(({ key, color, gradientId, name }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stackId="cost"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 3,
                stroke: color,
                strokeWidth: 2,
                fill: "hsl(224, 18%, 7%)",
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostChart;
