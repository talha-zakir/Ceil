# Project Handover & Context Memory

This file serves as the persistent memory for the Antigravity development team. It tracks the overall progress, architectural decisions, and current state so that development can be paused, resumed, or carried over to a new chat window when the context limits are reached.

---

## 📌 Project Overview
- **Goal / Description**: **AI API Cost & Quota Dashboard** — A centralized, minimalist, and privacy-first menubar/system-tray desktop application designed for solo developers and indie hackers. It tracks token usage, costs, and real-time rate limits across all top LLM providers (OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, etc.) to prevent billing surprises and protect the developer's "flow state."
- **Target Audience**: Indie developers, small agencies, and heavy CLI agent users spending $100–$1,000+/mo on AI APIs.
- **Monetization**: $9/mo subscription.
- **Core Philosophy**: "Anti-SaaS", high-intent, visually stunning, and entirely privacy-focused (Bring Your Own Key).
- **Selected Tech Stack**: Next.js 15 (App Router, Static HTML Export), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Sonner (toasts), Tremor/Recharts (charts), Tauri (Rust desktop shell), Supabase (PostgreSQL + Edge Functions), Clerk (Auth via deep-link), Stripe (Payments), OS Keychain (Secure key storage)

---

## 🏛️ Architectural & Key Decisions
- **Tauri** over Electron (Why: Rust-based, minimal memory, native OS integration for keychain and system tray)
- **Static HTML Export** (`output: 'export'`) — No Node.js server shipped in production desktop app
- **Local Micro-Proxy** (`localhost:9999`) in Rust for intercepting terminal CLI traffic and extracting rate-limit headers without reading prompt data
- **Adapter Design Pattern** for normalizing disparate provider header schemas into a unified `NormalizedQuota` TypeScript interface
- **Clerk Deep-Link Auth** (`apidash://auth?token=JWT`) to bypass cookie-based auth limitations in Tauri's custom protocol context
- **Dynamic Pricing Config** — Client polls `pricing.json` from Supabase Storage/Edge Function every 24h instead of hardcoding prices
- **BYOK (Bring Your Own Key)** — Keys stored in OS-native Keychain (Apple Keychain / Windows Credential Manager), never in localStorage or remote DB
- **Zero Data Retention** — Only polls billing/usage endpoints and header data; never reads, stores, or proxies prompt/completion text
- **Dark-mode-first** UI inspired by Linear, Vercel, and Arc Browser

---

## 🔄 Current Pipeline State
- **Active Step**: `@engineer` (Phase 16–17 Real-time validation, Key injection, and Offline cache Complete)
- **Last Updated**: 2026-05-29T15:00:00+09:00
- **Current Objective**: Key settings form connects to actual upstream validation, local proxy injects keys on-the-fly, and Supabase pricing uses localStorage caches for offline resilience.

---

## 📋 Progress Checklist
- [x] **1. Requirements & Spec Drafting** (Owner: `@pm`) — PRD input received; Technical Specification approved.
- [x] **2. Specification Approval** (Owner: `User`) — Approved via implementation plan.
- [x] **3. Scaffolding & Code Generation** (Owner: `@engineer` + `@proxy-engineer`)
  - [x] Phase 1: Next.js + Tailwind + shadcn/ui scaffold (Static Export config)
  - [x] Phase 2: Core UI components (token bars, budget trackers, cost charts)
  - [x] Phase 3: Provider adapter layer (`lib/providers/`) + `NormalizedQuota` interface
  - [x] Phase 4: Mock Data Generation and API Key hooks
  - [x] Phase 5: Tauri shell + system tray + OS keychain integration
  - [x] Phase 6: Local micro-proxy server (Rust, `localhost:9999`)
  - [x] Phase 7: Real-time rate-limit countdown UI (Frontend Integration)
  - [x] Phase 8: Velocity alerts & notification system (Frontend Integration)
  - [x] Phase 9: Clerk deep-link auth + Stripe subscription
  - [x] Phase 10: Dynamic pricing config polling
  - [x] Phase 11: Deployment & Distribution
  - [x] Phase 12: Smart Auto-Failover (Owner: `@engineer`) — Opt-in failover proxy, fallback chain mapping, Tauri IPC config sync.
  - [x] Phase 13: Rogue Loop Detection & Budget Caps (Owner: `@engineer`) — Sliding-window velocity limiter, daily spend cap, `cap-triggered` events.
  - [x] Phase 14: "What-If" Routing Intelligence UI (Owner: `@engineer`) — Cost optimizer widget with HumanEval accuracy tradeoff display.
  - [x] Phase 15: Transition to Real Data (Priority 1) (Owner: `@engineer`) — Local micro-proxy event hooks, localStorage persistence for quotas and transaction logs, header Demo Mode toggle switch, and real-time alerts.
  - [x] Phase 16: Key Injection & Real Validations (Priority 2) (Owner: `@engineer`) — Real upstream key validation endpoint, settings UI integration, and on-the-fly header injection.
  - [x] Phase 17: Pricing Offline Fallbacks (Priority 3) (Owner: `@engineer`) — localStorage caching and offline Promise.race timeouts for Supabase configurations.

---

## 🛠️ Modified Files & Structure
- `production_artifacts/implementation_plans/Technical_Specification.md`: Approved specification.
- `task.md`: Complete tracking checklist (all phases complete).
- `walkthrough.md`: Compilation fixes and structural updates details.
- `app_build/src-tauri/target/release/app.exe`: Compiled native standalone desktop application binary.
- `app_build/src-tauri/tauri.conf.json`: Configured production bundle identifier and direct Node build hooks.
- `app_build/src-tauri/src/main.rs`, `keychain.rs`, `proxy.rs`, `deeplink.rs`: Tauri and local proxy Rust logic.
- `app_build/src/components/providers/clerk-provider-wrapper.tsx`: CSR Clerk Provider wrapper.
- `app_build/src/lib/supabase/client.ts`, `app_build/src/hooks/use-pricing.ts`: Supabase pricing client and hook.
- `app_build/src/components/settings/billing-panel.tsx`: Stripe billing panel view.
- `app_build/src/components/settings/routing-config.tsx`: Failover toggle, budget caps, rogue loop protection UI.
- `app_build/src/components/dashboard/cost-optimizer.tsx`: "What-If" Routing Intelligence cost-accuracy widget.
- `app_build/src/hooks/use-quota.ts`: Persistent local storage quota state with rate-limit and usage event listeners.
- `app_build/src/hooks/use-cost-history.ts`: Persistent local transaction log analyzer for dynamic CostChart drawing.
- `app_build/src/components/layout/header.tsx`: Header navigation bar with animated Demo Mode switch.
- `app_build/src/components/layout/auth-listener.tsx`: Global Tauri event toaster for safety triggers and failover events.
- `app_build/src-tauri/src/keychain.rs`: Secure keychain module with added `test_api_key` endpoint validation command.
- `app_build/src/components/settings/api-key-form.tsx`: API keys input form wired to use Tauri's real-time connection validation.
- `app_build/src/hooks/use-pricing.ts`: Dynamic pricing fetcher equipped with local storage caches and query timeouts for offline support.

---

## ⚠️ Known Issues / Next Actions
1. **RESOLVED**: Clerk `ClerkRuntimeError` crash — fixed by decoding base64 publishable key payload and bypassing `ClerkProvider` when key is invalid.
2. **RESOLVED**: Duplicate React key warning (`mistral`) — fixed by using `provider-model` composite key.
3. **RESOLVED**: User updated Clerk publishable key to a valid domain (`fun-tortoise-19.clerk.accounts.dev`).
4. **NOTE**: The WiX installer packaging (`.msi`) was skipped due to a known command argument limitation with the ampersand character (`&`) in the folder name path. The standalone executable is fully self-contained and ready to run.
5. **NOTE**: The `CLERK_SECRET_KEY` in `.env.local` is a server-side secret and should NOT be committed to Git. Verify `.gitignore` includes `.env.local`.
6. **NEXT**: Rebuild Tauri desktop binary with updated Clerk key: `node node_modules/@tauri-apps/cli/tauri.js build --no-bundle`

---

## 🔄 Rollback & Removal Plan (Backup Guide)

If any of the newly added cost safety, failover, or routing intelligence features do not provide enough value or need to be reverted, follow these recovery/removal steps:

### 1. Reverting Smart Auto-Failover
- **Rust Proxy (`app_build/src-tauri/src/proxy.rs`)**:
  - Remove the auto-failover status checker at lines 218–267 (the block checking `response.status() == reqwest::StatusCode::TOO_MANY_REQUESTS && config_failover_enabled`).
  - Revert the `ProxyConfig` struct fields `failover_enabled` and `fallback_rules`.
- **Tauri State (`app_build/src-tauri/src/lib.rs`)**:
  - Revert the default configuration inside `.manage(...)` by removing `failover_enabled` and `fallback_rules`.
- **Next.js UI (`app_build/src/components/settings/routing-config.tsx`)**:
  - Delete the "Smart Auto-Failover" toggle card and fallback options dropdowns.

### 2. Reverting Rogue Loop Protection & Spend Caps
- **Rust Proxy (`app_build/src-tauri/src/proxy.rs`)**:
  - Remove the checks at lines 156–191 (verifying daily budget spend limit and sliding-window velocity stamps).
  - Delete `parse_usage_and_add_spend` and `estimate_request_cost` logic or empty their bodies.
- **Tauri State (`app_build/src-tauri/src/lib.rs`)**:
  - Remove the initialized AppState fields (`request_timestamps`, `daily_spend`, `last_spend_reset`).
- **Next.js UI (`app_build/src/components/settings/routing-config.tsx`)**:
  - Remove the "Runaway Cost Protection" input fields and settings toggle controls.

### 3. Reverting "What-If" Routing Intelligence UI
- **Dashboard Layout (`app_build/src/app/page.tsx`)**:
  - Delete the `<CostOptimizer quotas={quotas} />` element block and its import statement: `import { CostOptimizer } from "@/components/dashboard/cost-optimizer";`.
- **UI File**:
  - Delete `app_build/src/components/dashboard/cost-optimizer.tsx` completely.
