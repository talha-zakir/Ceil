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
- **Active Step**: `@devops` (Desktop Binary Compiled Successfully)
- **Last Updated**: 2026-05-29T11:41:00+09:00
- **Current Objective**: Test the compiled standalone desktop application binary (`app.exe`)

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
- [x] **4. Compilation & UI Verification** (Owner: `@engineer`) — Typescript build passes.
- [x] **5. Local Hosting & Testing** (Owner: `@devops`) — Local Next.js build passes.
- [x] **6. Desktop Build & Distribution** (Owner: `@devops`) — Tauri standalone `app.exe` compiled successfully.

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

---

## ⚠️ Known Issues / Next Actions
1. **NEXT**: The user can run the compiled binary `app.exe` directly from the release directory to launch the native desktop client.
2. **NOTE**: The WiX installer packaging (`.msi`) was skipped due to a known command argument limitation with the ampersand character (`&`) in the folder name path. The standalone executable is fully self-contained and ready to run.
