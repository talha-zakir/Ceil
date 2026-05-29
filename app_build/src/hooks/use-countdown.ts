"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountdownReturn {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
  totalSeconds: number;
}

export function useCountdown(resetAt: Date): UseCountdownReturn {
  const calcRemaining = useCallback(() => {
    return Math.max(0, Math.floor((resetAt.getTime() - Date.now()) / 1000));
  }, [resetAt]);

  const [totalSeconds, setTotalSeconds] = useState<number>(calcRemaining);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    setTotalSeconds(calcRemaining());
    lastTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      // Only update state once per second to avoid excessive re-renders
      if (now - lastTickRef.current >= 1000) {
        lastTickRef.current = now;
        const remaining = calcRemaining();
        setTotalSeconds(remaining);

        if (remaining <= 0) {
          return; // Stop the loop
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [resetAt, calcRemaining]);

  const isExpired = totalSeconds <= 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted: string;
  if (isExpired) {
    formatted = "Refreshing...";
  } else if (hours > 0) {
    formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return { hours, minutes, seconds, isExpired, formatted, totalSeconds };
}

export default useCountdown;
