# Ceil ── 📐 Never hit a 429 error again.

A minimalist, privacy-first native desktop dashboard tracking token capacity, rolling quotas, and spend for developers. Built with Next.js, Tauri, and Supabase.

---

## 💡 Why Ceil?
In the era of autonomous coding agents (like `claude code` or heavy Cursor Composer workflows), developers burn through API tokens faster than ever. When an agent suddenly hits a `429 Too Many Requests` error, your flow state is completely shattered.

Existing cloud observability suites are bloated and heavy, while web console dashboards force you to constantly context-switch out of your terminal. 

**Ceil lives in your macOS menu bar or Windows system tray.** It acts as a lightweight, zero-latency local proxy that extracts real-time rate limit headers across all major providers (OpenAI, Anthropic, Gemini, Groq, Mistral, and more) to give you an elegant, glanceable view of your remaining capacity before your scripts crash.

## ✨ Features

* **Universal Token & Quota Bars:** Side-by-side minimalist progress bars tracking your requests and tokens per minute/day across all professional LLM providers.
* **Flow-State Countdown Timers:** Real-time countdowns pulled straight from API headers (e.g., `anthropic-ratelimit-input-tokens-reset`), showing you exactly when your locked-out limits will refresh.
* **Privacy by Default (BYOK):** No remote proxies reading your data. Your API keys are encrypted and stored purely on your local hardware using native OS Keychain APIs (Apple Keychain / Windows Credential Manager).
* **Proactive Velocity Alerts:** Native desktop notifications, Slack, or Discord webhooks that trigger instantly if a local loop goes rogue and usage spikes.
* **"What-If" Routing Intelligence:** A lightweight local engine that looks at your text/token ratios and visually shows you exactly how much money you would save by swapping specific workloads to cheaper models (e.g., moving a debugging stream from GPT-4o to Gemini 1.5 Flash).

## 🛠️ Tech Stack

* **Desktop Shell:** [Tauri v2](https://tauri.app/) (Rust-based, ultra-light memory footprint)
* **Frontend:** [Next.js App Router](https://nextjs.org/) (Compiled via Static HTML Export)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Premium dark-mode design)
* **Charts:** [Tremor](https://www.tremor.so/) (Minimalist developer analytical components)
* **Database & Auth:** [Supabase](https://supabase.com/) + [Clerk](https://clerk.com/)

## 🔒 Security & Privacy Architecture
Ceil operates on a Zero-Knowledge paradigm:
1. Your raw text inputs, prompts, and completions **never** touch our servers. The app intercepts local traffic solely to extract HTTP status and rate-limit headers.
2. API keys are entirely hardware-isolated from the browser webview layer using Tauri's native Rust IPC channel connected straight to your OS security manager.

## 🚀 Local Development (Getting Started)

Since Ceil is open-core, you can compile and run the local client straight from source.

### Prerequisites
* Node.js (v18+)
* Rust & Cargo toolchain (for Tauri)

### Installation
1. Clone the repository:
```bash
   git clone [https://github.com/yourusername/ceil.git](https://github.com/yourusername/ceil.git)
   cd ceil