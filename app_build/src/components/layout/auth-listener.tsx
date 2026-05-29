"use client";

import { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";
import { toast } from "sonner";
import { AlertOctagon, Download, ShieldAlert } from "lucide-react";

interface CapTriggeredPayload {
  type: string;
  message: string;
}

interface FailoverPayload {
  original: string;
  fallback: string;
}

interface VersionConfig {
  latest: string;
  min_required: string;
  download_url: string;
  critical_update_message: string;
}

function parseVersion(v: string): number[] {
  return v.split(".").map((x) => {
    const parsed = parseInt(x, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  });
}

function isOutdatedVersion(current: string, required: string): boolean {
  const cur = parseVersion(current);
  const req = parseVersion(required);
  for (let i = 0; i < Math.max(cur.length, req.length); i++) {
    const c = cur[i] ?? 0;
    const r = req[i] ?? 0;
    if (c < r) return true;
    if (c > r) return false;
  }
  return false;
}

const showNativeNotification = (title: string, body: string) => {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
};

export function AuthListener() {
  const [isOutdated, setIsOutdated] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    let unlistenAuth: UnlistenFn | null = null;
    let unlistenCap: UnlistenFn | null = null;
    let unlistenFailover: UnlistenFn | null = null;

    // Request desktop notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    async function setupListeners() {
      const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        try {
          // 1. Perform Force Update Check
          const currentVersion = await getVersion();
          const response = await fetch(
            "https://raw.githubusercontent.com/talha-zakir/Ceil/main/production_artifacts/version.json",
            { cache: "no-store" }
          );
          if (response.ok) {
            const config: VersionConfig = await response.json();
            if (isOutdatedVersion(currentVersion, config.min_required)) {
              setIsOutdated(true);
              setUpdateMessage(config.critical_update_message);
              setDownloadUrl(config.download_url);
              return; // Halt event listening as user is blocked
            }
          }
        } catch (e) {
          console.warn("Update check failed, skipping blocking check.", e);
        }

        try {
          // 2. Listen for deep link authentication token
          unlistenAuth = await listen<{ token: string }>("auth-token-received", (event) => {
            const token = event.payload.token;
            toast.success("Authentication Successful!", {
              description: "Received secure token via deep link.",
            });
            console.log("JWT Received via deep link:", token);
          });

          // 3. Listen for safety cap triggers (spend limit / rogue loop protection)
          unlistenCap = await listen<CapTriggeredPayload>("cap-triggered", (event) => {
            const { type, message } = event.payload;
            const title = type === "budget" ? "Spend Cap Exceeded!" : "Rogue Loop Blocked!";
            toast.error(title, {
              description: message,
              duration: 8000,
              id: `safety-cap-${type}`, // Prevent duplicate toasts for same event type
            });
            showNativeNotification(title, message);
          });

          // 4. Listen for proxy auto-failovers
          unlistenFailover = await listen<FailoverPayload>("failover-occurred", (event) => {
            const { original, fallback } = event.payload;
            const title = "Auto-Failover Triggered";
            const message = `Provider "${original}" rate-limited. Re-routing request to "${fallback}"...`;
            toast.warning(title, {
              description: message,
              duration: 5000,
            });
            showNativeNotification(title, message);
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

  if (isOutdated) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
        <div className="w-full max-w-md p-6 rounded-2xl border border-rose-500/20 bg-slate-900 shadow-2xl shadow-rose-500/5 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertOctagon size={24} className="text-rose-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-100">Critical Update Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {updateMessage || "Your version of Ceil is outdated and no longer supported. Please download the latest version to continue."}
            </p>
          </div>
          <a
            href={downloadUrl || "https://github.com/talha-zakir/Ceil/raw/main/production_artifacts/ceil.exe"}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-black bg-rose-400 hover:bg-rose-300 transition-colors shadow-lg shadow-rose-400/10 cursor-pointer"
          >
            <Download size={16} />
            <span>Download Update</span>
          </a>
        </div>
      </div>
    );
  }

  return null;
}
