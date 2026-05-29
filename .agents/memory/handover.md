# Project Handover & Context Memory

This file serves as the persistent memory for the Antigravity development team. It tracks the overall progress, architectural decisions, and current state so that development can be paused, resumed, or carried over to a new chat window when the context limits are reached.

---

## 📌 Project Overview
- **Goal / Description**: **AI API Cost & Quota Dashboard** — A centralized, minimalist, and privacy-first menubar/system-tray desktop application designed for solo developers and indie hackers. It tracks token usage, costs, and real-time rate limits across all top LLM providers (OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, etc.) to prevent billing surprises and protect the developer's "flow state."
- **Target Audience**: Indie developers, small agencies, and heavy CLI agent users spending $100–$1,000+/mo on AI APIs.
- **Monetization**: $9/mo subscription.
- **Core Philosophy**: "Anti-SaaS", high-intent, visually stunning, and entirely privacy-focused (Bring Your Own Key).
- **Selected Tech Stack**: Next.js 15 (App Router, Static HTML Export), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Sonner (toasts), Tremor/Recharts (charts), Tauri (Rust desktop shell), Supabase (PostgreSQL + Edge Functions), Clerk (Auth via deep-link), Stripe (Payments), OS Keychain (Secure key storage)
- **Unified Landing Page / Web App Route**: Single-entry page routing (`src/app/page.tsx`) that detects the host environment. Browser/Vercel loads a premium landing page with 2 CTAs (Demo Sandbox vs. Desktop App Download). Tauri bypasses it, rendering the live dashboard console directly.
- **Dynamic Proxy Offline Banner**: The Next.js dashboard detects local proxy status on mount via loopback ping check. Shows a warning ribbon and redirects to download links if `localhost:9999` is offline.
- **Critical Force-Update Block**: Tauri desktop shell queries `version.json` from GitHub raw repository link. If the client version is lower than `min_required`, access is strictly locked behind a fullscreen blurred update overlay.

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
- **Force-Update & Version Control**: Host `version.json` in `production_artifacts` on GitHub. Next.js app running inside Tauri validates current client version against `min_required` parameters on boot to block outdated executables.

---

## 🔄 Current Pipeline State
- **Active Step**: `Testing & Verification` (Developer Alerts Sandbox Simulator integrated and pushed to GitHub)
- **Last Updated**: 2026-05-30T02:50:00+09:00
- **Current Objective**: Enable user to manually trigger and test safety alerts (Daily Budget Spend Cap, Rogue Loop spike detector, and Auto-Failover events) via developer simulator dashboard controls.

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
  - [x] Phase 11: Deployment & Distribution (Desktop wrapper built, standalone binary compiled)
  - [x] Phase 12: Smart Auto-Failover (Owner: `@engineer`) — Opt-in failover proxy, fallback chain mapping, Tauri IPC config sync.
  - [x] Phase 13: Rogue Loop Detection & Budget Caps (Owner: `@engineer`) — Sliding-window velocity limiter, daily spend cap, `cap-triggered` events.
  - [x] Phase 14: "What-If" Routing Intelligence UI (Owner: `@engineer`) — Cost optimizer widget with HumanEval accuracy tradeoff display.
  - [x] Phase 15: Transition to Real Data (Priority 1) (Owner: `@engineer`) — Local micro-proxy event hooks, localStorage persistence for quotas and transaction logs, header Demo Mode toggle switch, and real-time alerts.
  - [x] Phase 16: Key Injection & Real Validations (Priority 2) (Owner: `@engineer`) — Real upstream key validation endpoint, settings UI integration, and on-the-fly header injection.
  - [x] Phase 17: Pricing Offline Fallbacks (Priority 3) (Owner: `@engineer`) — localStorage caching and offline Promise.race timeouts for Supabase configurations.
  - [x] Phase 18: Model Family Modernization (Owner: `@engineer`) — Recognize modern flagship models, update settings config fallback mapping, cost optimizers, mock generator templates, and provider registry.
  - [x] Phase 19: Landing Page, Proxy Status Banner, and Force-Update Blocker (Owner: `@engineer`) — Dynamic host routing, loopback proxy ping checks, warning banners, and remote version control modal.
  - [x] Phase 20: Developer Simulator Sandbox for Verification (Owner: `@engineer`) — Integrated Rust simulation command (`simulate_safety_event`) and added developer dashboard triggers in `alert-config.tsx` with revert controls.

---

## 🛠️ Modified Files & Structure
- `production_artifacts/implementation_plans/Technical_Specification.md`: Approved specification.
- `task.md`: Complete tracking checklist (all phases complete).
- `walkthrough.md`: Final completion details and feature summary.
- `production_artifacts/ceil.exe`: Standalone release desktop executable.
- `production_artifacts/version.json`: Dynamic version config parameters for remote check.
- `app_build/LOCAL_SETUP.md` & `app_build/README.md`: Environment setup guides and documentation.
- `app_build/.env.example`: Local environment template.
- `app_build/src/app/page.tsx`: Landing page, connection checking, and main dashboard view.
- `app_build/src/components/layout/auth-listener.tsx`: Global event toaster with added auto-update check and blocking popup modal.
- `app_build/src-tauri/src/main.rs`, `keychain.rs`, `proxy.rs`, `deeplink.rs`: Tauri backend Rust proxy layer.
- `app_build/src/components/settings/routing-config.tsx`: Safety, failover, and caps config card.

---

## ⚠️ Known Issues / Next Actions
1. **RESOLVED**: WiX packaging skipped due to folder name path ampersand limit. Replaced by compiling standalone `ceil.exe` release binary to the artifacts path directly.
2. **RESOLVED**: Fixed the issue where What-If Routing widget displayed mock dollars ($3.15 spent / $3.08 saved) even with Demo Mode OFF and no API keys configured. Removed hardcoded mock token fallbacks so that the app renders a clean, premium "Awaiting Live API Traffic" empty state instead.
3. **RESOLVED**: Fixed page scrolling issue where users could not scroll down in the web browser or Tauri app. Changed body overflow from hidden to auto in `globals.css` to allow normal viewport scroll mechanics on the landing page and settings panel.
4. **RESOLVED**: Added Host, Origin, and Referer header validation in the Rust local proxy (`proxy.rs`) to prevent unauthorized cross-origin requests from external web scripts from abusing the local credentials injection.
5. **RESOLVED**: Added a live connection status card at the top of the Settings API Keys tab, which pings `localhost:9999` every 5 seconds to indicate if the proxy background listener is active or blocked.
6. **RESOLVED**: Fixed provider toggle settings reset bug by persisting toggle states to localStorage (`provider_enabled_${id}`) and dynamically filtering dashboard metrics in `useQuota()` so toggling off a provider suspends its tracking.
7. **FUTURE UPDATES & VERSION CONTROL METHOD**:
   - When you launch a major update:
     1. Build the updated binary: `node node_modules/@tauri-apps/cli/tauri.js build --no-bundle`
     2. Move the new `app.exe` to `production_artifacts/ceil.exe`.
     3. Update the `min_required` (and/or `latest`) version values inside `production_artifacts/version.json` (e.g. to `"0.2.0"`).
     4. Push the changes to GitHub.
     5. Outdated desktop applications will automatically fetch the new `version.json` config on boot, lock themselves, and redirect developers to download the latest binary.
8. **VERIFIED VERCEL PRODUCTION DEPLOYMENT**: Next.js frontend is deployed live on Vercel. Configured the project's Root Directory setting to `app_build` and uploaded all environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`).
9. **LOCAL RUNNING VERIFIED**: Tested Next.js dev server and compiled Tauri `app.exe` locally. Both run correctly and local proxy successfully binds to port 9999.
10. **ENHANCEMENTS COMPLETED**:
   - OS-native keychain badges indicating exactly where keys are saved (Windows Credential Manager / macOS Keychain).
   - Cost optimizer calculation uses live token statistics and allows config exporting (`ceil-routing-[scenario].json`).
   - Browser HTML5 notification integration triggers system tray push bubbles when runaway caps or failover rules execute.
   - Real-time proxy latency overhead tracking computes processing overhead in microseconds and displays it in the header (`0.2ms overhead`).

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

### 4. Reverting Developer Sandbox Alerts Simulator
- **Next.js UI (`app_build/src/components/settings/alert-config.tsx`)**:
  - Delete the "Alert Simulation Sandbox" JSX layout block.
  - Delete `triggerTestNotification` function and imports `toast` and `showVelocityAlert` if unused.
- **Rust Tauri Command (`app_build/src-tauri/src/proxy.rs`)**:
  - Remove `simulate_safety_event` Rust command definition from `proxy.rs`.
- **Tauri Register Handler (`app_build/src-tauri/src/lib.rs`)**:
  - Remove `simulate_safety_event` from the `tauri::generate_handler![...]` array in `lib.rs`.
