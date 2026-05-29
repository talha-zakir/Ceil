"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Bell, Palette } from "lucide-react";
import Link from "next/link";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { AlertConfig } from "@/components/settings/alert-config";
import { ProviderToggle } from "@/components/settings/provider-toggle";

const tabs = [
  { id: "keys", label: "API Keys", icon: Shield },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "providers", label: "Providers", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("keys");

  return (
    <div
      className="min-h-screen"
      style={{ background: "hsl(var(--bg-root))" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 glass-strong"
        style={{ borderBottom: "1px solid hsl(var(--border-subtle))" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div
            className="w-px h-5"
            style={{ background: "hsl(var(--border-subtle))" }}
          />
          <h1
            className="text-sm font-semibold"
            style={{ color: "hsl(var(--text-primary))" }}
          >
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div
          className="flex gap-1 p-1 rounded-lg mb-8"
          style={{ background: "hsl(var(--bg-secondary))" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center"
                style={{
                  color: isActive
                    ? "hsl(var(--text-primary))"
                    : "hsl(var(--text-tertiary))",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-md"
                    style={{ background: "hsl(var(--bg-tertiary))" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={14} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "keys" && <ApiKeyForm />}
          {activeTab === "alerts" && <AlertConfig />}
          {activeTab === "providers" && <ProviderToggle />}
        </motion.div>
      </div>
    </div>
  );
}
