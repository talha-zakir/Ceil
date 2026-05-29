"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { PROVIDER_LIST } from "@/lib/constants";
import { toast } from "sonner";
import { showVelocityAlert } from "@/components/dashboard/velocity-alert";

interface AlertSettings {
  velocityThreshold: number;
  budgetLimit: number;
  enabled: boolean;
  notificationChannel: "desktop" | "discord" | "slack";
}

export function AlertConfig() {
  const [alerts, setAlerts] = useState<Record<string, AlertSettings>>(() => {
    const initial: Record<string, AlertSettings> = {};
    PROVIDER_LIST.forEach((p) => {
      initial[p.id] = {
        velocityThreshold: 300,
        budgetLimit: 100,
        enabled: true,
        notificationChannel: "desktop",
      };
    });
    return initial;
  });

  const [globalEnabled, setGlobalEnabled] = useState(true);

  const updateAlert = (id: string, changes: Partial<AlertSettings>) => {
    setAlerts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...changes },
    }));
  };

  const triggerTestNotification = async (type: "budget" | "rogue" | "failover") => {
    // Request permission if default
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }

    const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("simulate_safety_event", { eventType: type });
      } catch (err) {
        console.error("Failed to invoke Tauri simulation event:", err);
      }
    } else {
      const showNative = (title: string, body: string) => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(title, { body });
          } catch (e) {
            console.warn("Failed to trigger native notification:", e);
          }
        }
      };

      if (type === "budget") {
        const title = "Spend Cap Exceeded!";
        const message = "Daily budget limit of $10.00 reached for OpenAI. Proxy requests paused.";
        showVelocityAlert({
          type: "critical",
          provider: "openai",
          message: "Daily budget limit of $10.00 exceeded. Proxy requests paused."
        });
        showNative(title, message);
      } else if (type === "rogue") {
        const title = "Rogue Loop Blocked!";
        const message = "High request velocity detected (720% spike on Anthropic Claude). Request blocked to prevent cost run-away.";
        showVelocityAlert({
          type: "critical",
          provider: "anthropic",
          message: "Velocity Spike! 720% increase in last 15m. Blocked to prevent rogue loops."
        });
        showNative(title, message);
      } else if (type === "failover") {
        const title = "Auto-Failover Triggered";
        const message = 'Provider "gemini" rate-limited. Re-routing request to "anthropic" Claude seamlessly...';
        showVelocityAlert({
          type: "warning",
          provider: "gemini",
          message: "Rate limit reached (429). Failover to fallback (anthropic) succeeded."
        });
        showNative(title, message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Simulation Panel */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-strong))",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bell size={16} />
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "hsl(var(--text-primary))" }}
            >
              Alert Simulation Sandbox
            </h3>
            <p
              className="text-xs"
              style={{ color: "hsl(var(--text-tertiary))" }}
            >
              Test desktop push notifications and real-time dashboard safety alerts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Spend Cap Exceeded */}
          <button
            onClick={() => triggerTestNotification("budget")}
            className="flex flex-col items-start text-left p-3.5 rounded-lg border transition-all hover:bg-white/[0.04] cursor-pointer group"
            style={{
              borderColor: "hsl(var(--border-subtle))",
              background: "hsl(var(--bg-root))",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Budget Exceeded
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-normal mb-3">
              Simulate reaching the daily/monthly budget spend cap limit.
            </p>
            <span className="mt-auto text-[10px] text-indigo-400 group-hover:underline flex items-center gap-1">
              Trigger Alert &rarr;
            </span>
          </button>

          {/* Rogue Loop Blocked */}
          <button
            onClick={() => triggerTestNotification("rogue")}
            className="flex flex-col items-start text-left p-3.5 rounded-lg border transition-all hover:bg-white/[0.04] cursor-pointer group"
            style={{
              borderColor: "hsl(var(--border-subtle))",
              background: "hsl(var(--bg-root))",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Rogue Loop / Spike
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-normal mb-3">
              Simulate blocking an abnormal high-velocity API request spike.
            </p>
            <span className="mt-auto text-[10px] text-indigo-400 group-hover:underline flex items-center gap-1">
              Trigger Alert &rarr;
            </span>
          </button>

          {/* Auto-Failover */}
          <button
            onClick={() => triggerTestNotification("failover")}
            className="flex flex-col items-start text-left p-3.5 rounded-lg border transition-all hover:bg-white/[0.04] cursor-pointer group"
            style={{
              borderColor: "hsl(var(--border-subtle))",
              background: "hsl(var(--bg-root))",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Auto-Failover
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-normal mb-3">
              Simulate seamlessly re-routing requests when Gemini rate-limits.
            </p>
            <span className="mt-auto text-[10px] text-indigo-400 group-hover:underline flex items-center gap-1">
              Trigger Alert &rarr;
            </span>
          </button>
        </div>
      </div>

      {/* Global Toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-subtle))",
        }}
      >
        <div className="flex items-center gap-3">
          {globalEnabled ? (
            <Volume2
              size={18}
              style={{ color: "hsl(var(--color-healthy))" }}
            />
          ) : (
            <VolumeX
              size={18}
              style={{ color: "hsl(var(--text-muted))" }}
            />
          )}
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "hsl(var(--text-primary))" }}
            >
              Velocity Alerts
            </p>
            <p
              className="text-xs"
              style={{ color: "hsl(var(--text-tertiary))" }}
            >
              Get notified when usage spikes unexpectedly
            </p>
          </div>
        </div>
        <button
          onClick={() => setGlobalEnabled(!globalEnabled)}
          className="relative w-10 h-5 rounded-full transition-colors"
          style={{
            background: globalEnabled
              ? "hsl(var(--color-healthy))"
              : "hsl(var(--bg-hover))",
          }}
        >
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
            animate={{ left: globalEnabled ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Per-Provider Alert Config */}
      {globalEnabled &&
        PROVIDER_LIST.map((provider) => {
          const settings = alerts[provider.id];

          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 space-y-4"
              style={{
                background: "hsl(var(--bg-secondary))",
                border: "1px solid hsl(var(--border-subtle))",
              }}
            >
              {/* Provider Name + Enable Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: `hsl(${provider.color})` }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "hsl(var(--text-primary))" }}
                  >
                    {provider.name}
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateAlert(provider.id, { enabled: !settings.enabled })
                  }
                  className="relative w-8 h-4 rounded-full transition-colors"
                  style={{
                    background: settings.enabled
                      ? `hsl(${provider.color})`
                      : "hsl(var(--bg-hover))",
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
                    animate={{ left: settings.enabled ? 17 : 2 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                </button>
              </div>

              {settings.enabled && (
                <div className="space-y-3 pl-4">
                  {/* Velocity Threshold Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-xs"
                        style={{ color: "hsl(var(--text-secondary))" }}
                      >
                        Velocity Spike Threshold
                      </span>
                      <span
                        className="text-xs font-mono font-medium"
                        style={{ color: `hsl(${provider.color})` }}
                      >
                        {settings.velocityThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      step={50}
                      value={settings.velocityThreshold}
                      onChange={(e) =>
                        updateAlert(provider.id, {
                          velocityThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, hsl(${provider.color}) 0%, hsl(${provider.color}) ${((settings.velocityThreshold - 100) / 900) * 100}%, hsl(var(--bg-hover)) ${((settings.velocityThreshold - 100) / 900) * 100}%, hsl(var(--bg-hover)) 100%)`,
                      }}
                    />
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "hsl(var(--text-muted))" }}
                    >
                      Alert when usage increases by {settings.velocityThreshold}
                      % in 15 minutes
                    </p>
                  </div>

                  {/* Budget Limit */}
                  <div>
                    <label
                      className="text-xs block mb-1.5"
                      style={{ color: "hsl(var(--text-secondary))" }}
                    >
                      Monthly Budget Limit
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: "hsl(var(--text-muted))" }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        value={settings.budgetLimit}
                        onChange={(e) =>
                          updateAlert(provider.id, {
                            budgetLimit: Number(e.target.value),
                          })
                        }
                        className="w-full pl-7 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
                        style={{
                          background: "hsl(var(--bg-root))",
                          border: "1px solid hsl(var(--border-default))",
                          color: "hsl(var(--text-primary))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
    </div>
  );
}

export default AlertConfig;
