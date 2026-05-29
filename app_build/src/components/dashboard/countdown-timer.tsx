"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  resetAt: Date;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function CountdownTimer({
  resetAt,
  label = "Resets in",
  compact = false,
  className,
}: CountdownTimerProps) {
  const { formatted, isExpired, totalSeconds } = useCountdown(resetAt);
  const isUrgent = totalSeconds > 0 && totalSeconds < 60;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact && (
        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            {isExpired ? (
              <motion.div
                key="refresh"
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <RefreshCw className="h-3.5 w-3.5 text-[hsl(var(--color-info))]" />
              </motion.div>
            ) : (
              <motion.div
                key="clock"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Clock
                  className={cn(
                    "h-3.5 w-3.5",
                    isUrgent
                      ? "text-[hsl(var(--color-critical))]"
                      : "text-[hsl(var(--text-tertiary))]"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-[11px] text-[hsl(var(--text-tertiary))]">{label}</span>
        </div>
      )}

      <motion.span
        className={cn(
          "font-mono text-xs font-semibold tracking-wider tabular-nums",
          isExpired && "text-[hsl(var(--color-info))]",
          isUrgent && "text-[hsl(var(--color-critical))]",
          !isExpired && !isUrgent && "text-[hsl(var(--text-secondary))]"
        )}
        animate={
          isUrgent
            ? {
                opacity: [1, 0.4, 1],
                scale: [1, 1.02, 1],
              }
            : {}
        }
        transition={
          isUrgent
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      >
        {formatted}
      </motion.span>
    </div>
  );
}

export default CountdownTimer;
