"use client";

import { useEffect } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { toast } from "sonner";

interface CapTriggeredPayload {
  type: string;
  message: string;
}

interface FailoverPayload {
  original: string;
  fallback: string;
}

export function AuthListener() {
  useEffect(() => {
    let unlistenAuth: UnlistenFn | null = null;
    let unlistenCap: UnlistenFn | null = null;
    let unlistenFailover: UnlistenFn | null = null;

    async function setupListeners() {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        try {
          // 1. Listen for deep link authentication token
          unlistenAuth = await listen<{ token: string }>("auth-token-received", (event) => {
            const token = event.payload.token;
            toast.success("Authentication Successful!", {
              description: "Received secure token via deep link.",
            });
            console.log("JWT Received via deep link:", token);
          });

          // 2. Listen for safety cap triggers (spend limit / rogue loop protection)
          unlistenCap = await listen<CapTriggeredPayload>("cap-triggered", (event) => {
            const { type, message } = event.payload;
            const title = type === "budget" ? "Spend Cap Exceeded!" : "Rogue Loop Blocked!";
            toast.error(title, {
              description: message,
              duration: 8000,
              id: `safety-cap-${type}`, // Prevent duplicate toasts for same event type
            });
          });

          // 3. Listen for proxy auto-failovers
          unlistenFailover = await listen<FailoverPayload>("failover-occurred", (event) => {
            const { original, fallback } = event.payload;
            toast.warning("Auto-Failover Triggered", {
              description: `Provider "${original}" rate-limited. Re-routing request to "${fallback}"...`,
              duration: 5000,
            });
          });

        } catch (err) {
          console.warn("Failed to setup Tauri event listeners", err);
        }
      }
    }

    setupListeners();

    return () => {
      if (unlistenAuth) unlistenAuth();
      if (unlistenCap) unlistenCap();
      if (unlistenFailover) unlistenFailover();
    };
  }, []);

  return null;
}
