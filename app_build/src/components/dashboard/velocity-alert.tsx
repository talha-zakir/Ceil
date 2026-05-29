"use client";

import { toast } from "sonner";
import { AlertTriangle, XCircle, Info, ExternalLink, X } from "lucide-react";
import { PROVIDERS } from "@/lib/constants";
import type { VelocityEvent, ProviderId } from "@/lib/providers/types";

interface VelocityAlertConfig {
  onViewDetails?: (event: VelocityEvent) => void;
}

const ALERT_STYLES: Record<
  VelocityEvent["type"],
  {
    icon: typeof AlertTriangle;
    borderColor: string;
    bgColor: string;
    iconColor: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    borderColor: "hsl(45, 93%, 58%)",
    bgColor: "hsl(45, 93%, 58%, 0.06)",
    iconColor: "hsl(45, 93%, 58%)",
  },
  critical: {
    icon: XCircle,
    borderColor: "hsl(0, 84%, 60%)",
    bgColor: "hsl(0, 84%, 60%, 0.06)",
    iconColor: "hsl(0, 84%, 60%)",
  },
  info: {
    icon: Info,
    borderColor: "hsl(210, 100%, 66%)",
    bgColor: "hsl(210, 100%, 66%, 0.06)",
    iconColor: "hsl(210, 100%, 66%)",
  },
};

export function showVelocityAlert(event: VelocityEvent, config?: VelocityAlertConfig) {
  const style = ALERT_STYLES[event.type];
  const Icon = style.icon;
  const provider = PROVIDERS[event.provider];

  toast.custom(
    (t) => (
      <div
        className="w-full max-w-[380px] overflow-hidden rounded-xl border backdrop-blur-xl"
        style={{
          borderColor: style.borderColor,
          backgroundColor: "hsl(224, 18%, 7%)",
          boxShadow: `0 0 24px ${style.bgColor}, 0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ backgroundColor: style.borderColor }} />

        <div className="p-3.5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: style.bgColor }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: style.iconColor }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold"
                  style={{ color: `hsl(${provider.color})` }}
                >
                  {provider.name}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color: style.iconColor,
                    backgroundColor: style.bgColor,
                  }}
                >
                  {event.type}
                </span>
              </div>

              <p className="text-[12px] leading-relaxed text-[hsl(0,0%,70%)]">
                {event.message}
              </p>

              {/* Actions */}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    config?.onViewDetails?.(event);
                    toast.dismiss(t);
                  }}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-white/[0.06]"
                  style={{ color: style.iconColor }}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Details
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-[hsl(220,8%,50%)] transition-colors hover:bg-white/[0.06] hover:text-[hsl(0,0%,70%)]"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: event.type === "critical" ? 10_000 : 6_000,
      position: "bottom-right",
    }
  );
}

/* Convenience re-export as component for imperative triggers in JSX */
export function VelocityAlert() {
  // This is a no-op render component — alerts are triggered imperatively via showVelocityAlert()
  // The Sonner <Toaster /> must be mounted in the layout
  return null;
}

export default VelocityAlert;
