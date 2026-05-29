"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Settings, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useQuota } from "@/hooks/use-quota";

interface HeaderProps {
  status: "healthy" | "warning" | "critical";
}

const statusConfig = {
  healthy: {
    color: "hsl(var(--color-healthy))",
    label: "All Systems Healthy",
    pulse: false,
  },
  warning: {
    color: "hsl(var(--color-warning))",
    label: "Some Limits Approaching",
    pulse: true,
  },
  critical: {
    color: "hsl(var(--color-critical))",
    label: "Attention Required",
    pulse: true,
  },
};

export function Header({ status }: HeaderProps) {
  const config = statusConfig[status];
  const { demoMode, setDemoMode } = useQuota();
  const [latencyOverhead, setLatencyOverhead] = useState<number | null>(null);

  useEffect(() => {
    let unlistenOverhead: (() => void) | null = null;
    const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;
    
    async function setupListener() {
      if (isTauri) {
        try {
          const { listen } = await import("@tauri-apps/api/event");
          unlistenOverhead = await listen<{ overheadMs: number }>("proxy-overhead-updated", (event) => {
            setLatencyOverhead(event.payload.overheadMs);
          });
        } catch (e) {
          console.warn("Failed to listen for proxy overhead updates:", e);
        }
      }
    }
    
    setupListener();
    return () => {
      if (unlistenOverhead) unlistenOverhead();
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 h-12 shrink-0"
      style={{
        background: "hsl(var(--bg-primary) / 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid hsl(var(--border-subtle))",
      }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--color-openai) / 0.15), hsl(var(--color-gemini) / 0.15))",
            border: "1px solid hsl(var(--border-subtle))",
          }}
        >
          <Zap size={14} style={{ color: "hsl(var(--color-openai))" }} />
        </div>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: "hsl(var(--text-primary))" }}
        >
          API Dashboard
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{
            background: "hsl(var(--bg-tertiary))",
            color: "hsl(var(--text-muted))",
          }}
        >
          BETA
        </span>
      </div>

      {/* Right: Status + Settings */}
      <div className="flex items-center gap-4">
        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md" style={{ background: "hsl(var(--bg-secondary))", border: "1px solid hsl(var(--border-subtle))" }}>
          <span className="text-[10px] font-medium tracking-wide uppercase" style={{ color: demoMode ? "hsl(var(--color-openai))" : "hsl(var(--text-muted))" }}>
            Demo
          </span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="relative w-8 h-4 rounded-full transition-colors duration-200"
            style={{
              background: demoMode ? "hsl(var(--color-openai) / 0.8)" : "hsl(var(--bg-tertiary))",
            }}
          >
            <motion.div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
              animate={{ left: demoMode ? 18 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Wifi size={12} style={{ color: "hsl(var(--text-tertiary))" }} />
          <span
            className="text-[11px] select-none"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            Proxy Active {latencyOverhead !== null ? `(overhead: ${latencyOverhead < 0.1 ? "<0.1" : latencyOverhead.toFixed(1)}ms)` : ""}
          </span>
        </div>

        {/* System Status Dot */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: config.color }}
              animate={
                config.pulse
                  ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                  : {}
              }
              transition={
                config.pulse
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : {}
              }
            />
            {config.pulse && (
              <div
                className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30"
                style={{ background: config.color }}
              />
            )}
          </div>
          <span
            className="text-[11px] hidden sm:inline"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            {config.label}
          </span>
        </div>

        {/* Settings Link */}
        <Link
          href="/settings"
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
          style={{
            color: "hsl(var(--text-tertiary))",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--bg-hover))";
            e.currentTarget.style.color = "hsl(var(--text-primary))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "hsl(var(--text-tertiary))";
          }}
        >
          <Settings size={14} />
        </Link>

        <div className="w-[1px] h-4" style={{ background: "hsl(var(--border-subtle))" }} />

        {/* Clerk Auth Controls */}
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{ color: "hsl(var(--text-secondary))" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--text-primary))")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--text-secondary))")}
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm"
                style={{
                  background: "hsl(var(--text-primary))",
                  color: "hsl(var(--bg-root))",
                }}
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-7 h-7",
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}

export default Header;
