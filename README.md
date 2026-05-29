# 🛡️ AI API Cost & Quota Dashboard

A centralized, minimalist, and **privacy-first** menubar/system-tray application designed for solo developers and indie hackers. Track token usage, costs, and real-time rate limits across **all top LLM providers** — preventing billing surprises and protecting your "flow state."

---

## 🎯 The Problem

Indie developers and small agencies using AI APIs ($100–$1,000+/mo) have no real-time visibility into:
- How fast they're burning through rate limits
- When locked-out limits will refresh
- Whether a stuck loop is silently draining their budget
- Which provider routing could save them money

## 💡 The Solution

A native desktop menubar app that:
- Shows **real-time quota bars** and countdown timers for all configured LLM providers
- Sends **velocity spike alerts** before you hit billing surprises
- Calculates **"What-If" cost optimization** recommendations weekly
- Runs a **local proxy** to capture CLI/terminal traffic headers — zero prompt data retention
- Stores API keys in your **OS-native Keychain** — never in the cloud

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Shell** | Tauri (Rust) — menubar/system tray app |
| **Frontend** | Next.js 15 (App Router, Static Export) |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Animations** | Framer Motion, Sonner (toasts) |
| **Charts** | Tremor / Recharts |
| **Backend** | Supabase (PostgreSQL, Edge Functions) |
| **Auth** | Clerk (deep-link JWT handshake) |
| **Payments** | Stripe ($9/mo subscription) |
| **Key Storage** | OS Keychain (Apple Keychain / Windows Credential Manager) |
| **Local Proxy** | Rust micro-proxy on `localhost:9999` |

---

## 📂 Project Structure

```text
├── .agents/                  # AI agent team configuration
│   ├── agents.md             # Personas, roles, and project config
│   ├── memory/
│   │   ├── handover.md       # Active project state & decisions
│   │   └── log.md            # Chronological development log
│   ├── workflows/
│   │   ├── startcycle.md     # /startcycle — Begin the dev pipeline
│   │   ├── resume.md         # /resume — Resume from last checkpoint
│   │   └── sync.md           # /sync — Save mid-session progress
│   └── skills/               # Agent-specific skill definitions
│
├── production_artifacts/     # Specs, plans, and documentation
│   ├── inputs/               # User-provided PRD and requirements
│   ├── implementation_plans/ # Technical specifications
│   └── outputs/              # Walkthroughs and final docs
│
├── app_build/                # Generated application code
│   ├── src/                  # Next.js frontend source
│   ├── src-tauri/            # Tauri Rust backend source
│   └── ...                   # Config files, package.json, etc.
│
└── .gitignore
```

---

## 🚀 Getting Started

### Development Pipeline
1. **Start**: Run `/startcycle` with your feature idea
2. **Review**: The PM drafts a Technical Specification → approve or request changes
3. **Build**: Engineer + Proxy Engineer scaffold and implement
4. **Audit**: QA hunts for bugs and security issues
5. **Deploy**: DevOps launches the local dev server or compiles the Tauri desktop build

### Session Persistence
Save mid-session progress:
```bash
/sync
```

Resume in a new chat window:
```bash
/resume
```

---

## 🔒 Privacy & Security

- **BYOK**: Bring Your Own Key — no API proxies, no cloud key storage
- **Zero Data Retention**: Only polls billing/usage endpoints and rate-limit headers
- **OS Keychain**: Keys stored via Tauri's Rust layer in Apple Keychain / Windows Credential Manager
- **Local Proxy**: Captures HTTP headers only — never reads, stores, or proxies prompt/completion text

---

## 💰 Monetization

**$9/month** subscription — "Anti-SaaS" pricing for a high-intent developer tool.
