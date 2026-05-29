updated_markdown_content = """# Product Requirements Document (PRD): AI API Cost & Quota Dashboard

## 1. Product Overview
A centralized, minimalist, and privacy-first menubar/system-tray application designed for solo developers and indie hackers. It tracks token usage, costs, and real-time rate limits across **all top LLM providers** (OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, etc.) to prevent billing surprises and protect the developer's "flow state."

**Target Audience:** Indie developers, small agencies, and heavy CLI agent users spending $100–$1,000+/mo on AI APIs.
**Monetization:** $9/mo subscription.
**Core Philosophy:** "Anti-SaaS", high-intent, visually stunning, and entirely privacy-focused (Bring Your Own Key).

---

## 2. Feature Scope & Architecture Tiers

### Tier 1: Live "Flow State" Monitors (The Hook)
* **Universal API Compatibility:** Agnostic tracking for all major professional APIs. The system scales to support OpenAI, Anthropic, Google Gemini, Groq, Mistral, and any other provider that returns standard billing or rate-limit data.
* **Unified Quota Bars:** Side-by-side minimalist progress bars showing remaining tokens/requests per minute/day for all configured providers.
* **The Rolling Window Countdown:** Real-time countdowns derived from API response headers (e.g., `anthropic-ratelimit-input-tokens-reset` or OpenAI's `x-ratelimit-reset`). Shows exactly when locked-out limits will refresh.
* **Native System Tray/Menu Bar App:** A persistent, glanceable view that lives on the desktop OS, completely removing the need to switch contexts to a web browser.

### Tier 2: Wallet Protectors (The Value)
* **Proactive Velocity Alerts:** Native desktop notifications, Discord, or Slack pings triggered by sudden velocity spikes rather than just total spend (e.g., *"Warning: Your Anthropic usage spiked 300% in the last 15 minutes. Did a loop get stuck?"*).
* **Actionable "What-If" Insights:** Weekly intelligence that calculates alternative routing savings (e.g., *"You processed 4M text-only tokens on GPT-4o. Rerouting this specific workload to Gemini 1.5 Flash would have saved you $38 this month."*).

### Tier 3: Privacy-First Architecture (The Trust)
* **Bring Your Own Key (BYOK):** No proxies. Users input read-only API keys. 
* **Local-First Encryption:** Keys are stored locally on the user's machine via the desktop wrapper, or optionally encrypted in Supabase with a user-owned secret key.
* **Zero Data Retention:** The app only polls provider billing/usage endpoints and header data. It **never** reads, stores, or proxies actual prompt or completion text.

---

## 3. Tech Stack Blueprint

* **Desktop Shell:** Tauri (Rust-based, lightning-fast, minimal memory usage to compile the Next.js app into a macOS/Windows menubar app). Run Next.js as a Static HTML Export (`output: 'export'`) to avoid shipping a Node server in production.
* **Frontend Framework:** Next.js (App Router)
* **Styling & UI:** Tailwind CSS, `shadcn/ui` (for premium, dark-mode-first aesthetic)
* **Animations:** Framer Motion (for liquid-smooth layout transitions and menubar animations) + Sonner (for modern, premium stackable toast notifications)
* **Data Visualization:** Tremor or Recharts (minimalist, lightweight developer charts)
* **Backend & Database:** Supabase (PostgreSQL, Edge Functions)
* **Authentication & Billing:** Clerk (Auth) + Stripe (Payments)
* **Secure Key Storage:** OS-level Keychain (Apple Keychain via macOS / Credential Manager via Windows) accessed directly via Tauri's Rust layer. Never store raw API keys in browser localStorage or non-encrypted remote databases.

---

## 4. Key Engineering Obstacles & Architectural Solutions

### Obstacle 1: Capturing Live CLI Agent / Terminal Traffic
* **The Problem:** Local developer scripts and terminal tools (like `claude code` or Python scripts) run outside the browser environment, preventing a passive dashboard from reading their real-time HTTP response rate-limit headers.
* **The Solution:** The Tauri client must spin up a lightweight, zero-latency local proxy server (e.g., `http://localhost:9999`) on the user's machine. The developer exports a local environment variable (`export OPENAI_BASE_URL="http://localhost:9999/v1"`). The Rust proxy intercepts the stream, extracts the rate-limit headers to update the webview UI, and immediately passes through the response.

### Obstacle 2: Clerk Authentication Protocol Conflict in Desktop Apps
* **The Problem:** Clerk relies heavily on standard web domain cookies (`https://`). When Next.js is statically exported into Tauri, it runs over a custom protocol context (`tauri://localhost` or `file://`), which breaks standard cookie-based authentication.
* **The Solution:** Implement deep-link token routing. Direct the user to login via their native external browser to a hosted Clerk page on your web domain. Upon success, redirect them using a custom deep link app schema (`apidash://auth?token=JWT_STRING`). Tauri intercepts the deep link, parses the JWT token, and saves it in the native system Keychain.

### Obstacle 3: The Fragmented Header Schema
* **The Problem:** Every LLM provider uses completely arbitrary header formats for token tracking (e.g., Anthropic uses `anthropic-ratelimit-input-tokens-remaining` while OpenAI uses `x-ratelimit-remaining-tokens`).
* **The Solution:** Implement an internal Adapter Design Pattern. Standardize all disparate upstream streams into a singular structural wrapper interface before data hits the Next.js UI rendering thread.

### Obstacle 4: Upstream API Pricing Volatility
* **The Problem:** LLM providers frequently drop prices or update token ratios. Hardcoding pricing logic directly into the compiled desktop application forces non-stop manual app updates.
* **The Solution:** Treat the desktop client as a "dumb calculator" for costs. Build a dynamic configuration lifecycle where the client silently polls a centralized `pricing.json` array hosted inside a Supabase storage bucket or Edge Function once every 24 hours.

---

## 5. Step-by-Step Build Strategy

### Phase 1: The Local MVP (Weeks 1–2)
* Initialize Next.js + Tailwind + shadcn/ui.
* Create the core UI components for token bars, budget trackers, and cost charts.
* Implement secure local storage mechanism for multiple API keys via Tauri's Rust-to-OS keychain layer.
* Build the core polling engines to fetch historical and current usage from OpenAI, Anthropic, and Gemini billing endpoints.

### Phase 2: Universal Header Parsing & The Hook (Weeks 3–4)
* Develop the real-time rate limit tracker. 
* Implement the local micro-proxy listener in Rust to parse specific rate-limit headers across *all* integrated providers.
* Standardize the parsed data into a unified countdown UI regardless of the provider's native header format.

### Phase 3: Premium Polish & Tauri Wrapper (Weeks 5–6)
* Wrap the Next.js application in Tauri. Configure it to run as a native menubar/system tray app.
* Refine micro-interactions: smooth progress bar animations using Framer Motion and a high-contrast dark mode.
* Implement local OS push notifications for velocity alerts.
* Integrate Clerk deep-linking and Stripe to manage the $9/month tier.

---

## 6. AI Agent Build Prompt

*Copy and paste the following prompt into Cursor, GitHub Copilot Chat, or your preferred AI coding agent when you are ready to start building:*

> **Context:**
> I am building a privacy-first AI API Cost & Quota Dashboard. It will be a Next.js (App Router) application wrapped in Tauri to serve as a macOS/Windows menubar app. The UI must be highly aesthetic, minimalist, and use Tailwind CSS with `shadcn/ui`, Framer Motion, and Tremor charts. The backend relies on Supabase and Clerk.
> 
> **Core Architectural Rules for this Project:**
> 1. **Privacy First (BYOK):** We never proxy prompt data. We only track usage, billing, and rate-limit parameters from LLM providers (OpenAI, Anthropic, Gemini, Groq, etc.). API keys are stored locally via Tauri on the native OS Keychain (Apple Keychain / Windows Credential Manager).
> 2. **Traffic Capture:** We capture real-time headers by spinning up a local proxy server in Tauri's Rust layer (e.g., `localhost:9999`) that intercepts outbound terminal traffic, parses headers, and updates the local UI.
> 3. **Universal Adapter Setup:** Implement an Adapter Design Pattern to map disparate provider headers (OpenAI, Anthropic, etc.) into a single, unified `NormalizedQuota` TypeScript interface.
> 4. **Auth Handshake:** Use custom deep-link handling (`apidash://auth`) to catch JWT tokens from our external Clerk web login flow and route them into the desktop wrapper context.
> 5. **Design:** Dark-mode first, extremely clean, similar to premium developer tools like Linear or Vercel. 
> 
> **First Task:**
> Please scaffold the initial Next.js project structure optimized for a static HTML export (`output: 'export'`). 
> 1. Set up the `shadcn/ui` and Tailwind CSS foundation.
> 2. Create a modular `lib/providers/` directory structure where we will define interfaces for different LLM APIs (e.g., `openai.ts`, `anthropic.ts`). 
> 3. Draft the TypeScript interface for standardizing `NormalizedQuota` across any potential API provider.
> 4. Build a visually stunning, mock-data dashboard page (`app/page.tsx`) using Framer Motion that mimics a native menubar dropdown showing side-by-side progress bars for API rate limits and a total cost chart.
"""

with open("/mnt/data/llm_cost_dashboard_prd.md", "w", encoding="utf-8") as f:
    f.write(updated_markdown_content)

print("File successfully updated: /mnt/data/llm_cost_dashboard_prd.md")