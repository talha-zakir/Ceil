"use client";

import { motion } from "framer-motion";
import { Zap, Settings, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

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
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Wifi size={12} style={{ color: "hsl(var(--text-tertiary))" }} />
          <span
            className="text-[11px]"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            Proxy Active
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
