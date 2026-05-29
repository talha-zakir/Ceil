"use client";

import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";

export function BillingPanel() {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

  return (
    <div className="p-6 rounded-xl border" style={{ 
      borderColor: "hsl(var(--border-subtle))",
      background: "hsl(var(--bg-secondary) / 0.5)" 
    }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: "hsl(var(--color-openai) / 0.15)" }}>
          <CreditCard size={18} style={{ color: "hsl(var(--color-openai))" }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "hsl(var(--text-primary))" }}>
            Pro Subscription
          </h3>
          <p className="text-xs" style={{ color: "hsl(var(--text-secondary))" }}>
            Upgrade for infinite proxy throughput and historical charts.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border mb-4" style={{ 
        background: "hsl(var(--bg-primary))",
        borderColor: "hsl(var(--border-subtle))"
      }}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} style={{ color: "hsl(var(--color-healthy))" }} />
          <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>
            $9.00 / month
          </span>
        </div>
        <a 
          href={stripeLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ 
            background: "hsl(var(--text-primary))", 
            color: "hsl(var(--bg-root))" 
          }}
        >
          Upgrade to Pro
          <ExternalLink size={12} />
        </a>
      </div>

      <p className="text-[11px]" style={{ color: "hsl(var(--text-tertiary))" }}>
        Payments are securely processed by Stripe. Your subscription will sync instantly across your devices when authenticated via Clerk.
      </p>
    </div>
  );
}
