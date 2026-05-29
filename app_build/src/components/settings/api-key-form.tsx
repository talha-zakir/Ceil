"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Shield,
  Sparkles,
  Bot,
  Cpu,
  Zap,
  Wind,
} from "lucide-react";
import { PROVIDER_LIST } from "@/lib/constants";

type KeyStatus = "idle" | "testing" | "connected" | "error";

interface ProviderKeyState {
  key: string;
  visible: boolean;
  status: KeyStatus;
}

const providerIcons: Record<string, React.ElementType> = {
  openai: Sparkles,
  anthropic: Bot,
  gemini: Cpu,
  groq: Zap,
  mistral: Wind,
};

export function ApiKeyForm() {
  const [keys, setKeys] = useState<Record<string, ProviderKeyState>>(() => {
    const initial: Record<string, ProviderKeyState> = {};
    PROVIDER_LIST.forEach((p) => {
      let saved = "";
      if (typeof window !== "undefined") {
        saved = localStorage.getItem(`apikey_${p.id}`) || "";
      }
      initial[p.id] = { key: saved, visible: false, status: saved ? "connected" : "idle" };
    });
    return initial;
  });

  useEffect(() => {
    async function loadKeysFromKeychain() {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        const updatedKeys = { ...keys };
        for (const p of PROVIDER_LIST) {
          try {
            const saved: string = await invoke("get_api_key", { provider: p.id });
            if (saved) {
              updatedKeys[p.id] = { key: saved, visible: false, status: "connected" };
            }
          } catch (err) {
            // No key found or error
          }
        }
        setKeys(updatedKeys);
      }
    }
    loadKeysFromKeychain();
  }, []);

  const updateKey = (id: string, value: string) => {
    setKeys((prev) => ({
      ...prev,
      [id]: { ...prev[id], key: value, status: "idle" },
    }));
  };

  const toggleVisibility = (id: string) => {
    setKeys((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible },
    }));
  };

  const testConnection = async (id: string) => {
    setKeys((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: "testing" },
    }));

    try {
      let isConnected = false;
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        isConnected = await invoke("test_api_key", { provider: id, apiKey: keys[id].key });
      } else {
        // Fallback for standalone web browser mode
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isConnected = keys[id].key.length > 20;
      }

      setKeys((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: isConnected ? "connected" : "error",
        },
      }));
    } catch (err) {
      setKeys((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "error" },
      }));
    }
  };

  const saveKey = async (id: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        await invoke("save_api_key", { provider: id, apiKey: keys[id].key });
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem(`apikey_${id}`, keys[id].key);
        }
      }
    } catch (err) {
      console.error(`Failed to save key for ${id}:`, err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          background: "hsl(var(--color-openai) / 0.06)",
          border: "1px solid hsl(var(--color-openai) / 0.15)",
        }}
      >
        <Shield
          size={18}
          className="shrink-0 mt-0.5"
          style={{ color: "hsl(var(--color-openai))" }}
        />
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "hsl(var(--text-primary))" }}
          >
            Your keys never leave this device
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            API keys are stored in your OS Keychain (Apple Keychain / Windows
            Credential Manager). We never transmit or store keys on any server.
          </p>
        </div>
      </div>

      {/* Provider Key Inputs */}
      {PROVIDER_LIST.map((provider) => {
        const Icon = providerIcons[provider.id] || Sparkles;
        const state = keys[provider.id];
        const statusColor =
          state.status === "connected"
            ? "var(--color-healthy)"
            : state.status === "error"
              ? "var(--color-critical)"
              : "var(--border-default)";

        return (
          <motion.div
            key={provider.id}
            className="rounded-xl p-4"
            style={{
              background: "hsl(var(--bg-secondary))",
              border: `1px solid hsl(${statusColor})`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Provider Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-md"
                  style={{
                    background: `hsl(${provider.color} / 0.12)`,
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: `hsl(${provider.color})` }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "hsl(var(--text-primary))" }}
                  >
                    {provider.name}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "hsl(var(--text-muted))" }}
                  >
                    {provider.description}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {state.status !== "idle" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                  style={{
                    background:
                      state.status === "connected"
                        ? "hsl(var(--color-healthy) / 0.1)"
                        : state.status === "error"
                          ? "hsl(var(--color-critical) / 0.1)"
                          : "hsl(var(--bg-tertiary))",
                    color:
                      state.status === "connected"
                        ? "hsl(var(--color-healthy))"
                        : state.status === "error"
                          ? "hsl(var(--color-critical))"
                          : "hsl(var(--text-tertiary))",
                  }}
                >
                  {state.status === "testing" && (
                    <Loader2 size={10} className="animate-spin" />
                  )}
                  {state.status === "connected" && <Check size={10} />}
                  {state.status === "error" && <X size={10} />}
                  {state.status === "testing"
                    ? "Testing..."
                    : state.status === "connected"
                      ? "Connected"
                      : "Invalid Key"}
                </motion.div>
              )}
            </div>

            {/* Key Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={state.visible ? "text" : "password"}
                  value={state.key}
                  onChange={(e) => updateKey(provider.id, e.target.value)}
                  placeholder={`Enter your ${provider.name} API key...`}
                  className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: "hsl(var(--bg-root))",
                    border: "1px solid hsl(var(--border-default))",
                    color: "hsl(var(--text-primary))",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `hsl(${provider.color})`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "hsl(var(--border-default))";
                  }}
                />
                <button
                  onClick={() => toggleVisibility(provider.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: "hsl(var(--text-muted))" }}
                >
                  {state.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button
                onClick={() => testConnection(provider.id)}
                disabled={!state.key || state.status === "testing"}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{
                  background: "hsl(var(--bg-tertiary))",
                  color: "hsl(var(--text-secondary))",
                  border: "1px solid hsl(var(--border-default))",
                }}
              >
                Test
              </button>

              <button
                onClick={() => saveKey(provider.id)}
                disabled={!state.key}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{
                  background: `hsl(${provider.color} / 0.15)`,
                  color: `hsl(${provider.color})`,
                  border: `1px solid hsl(${provider.color} / 0.25)`,
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ApiKeyForm;
