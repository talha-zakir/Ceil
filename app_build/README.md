# 🛡️ Ceil — AI API Cost & Quota Dashboard

**Privacy-first, real-time LLM usage monitoring for indie developers.**

Ceil is a modern developer tool that monitors, optimizes, and secures your LLM API usage. It operates via a local micro-proxy to parse rate limits and inject credentials on-the-fly, keeping your API keys securely stored in your local OS Keychain.

---

## 🚀 Getting Started

### 1. Local Setup
Follow the instructions in our [**Local Setup & Security Guide**](file:///C:/0_Antigravity%20Template/Codelab_Antigravity/5_AI%20API%20Cost%20&%20Quota%20Dashboard/app_build/LOCAL_SETUP.md) to copy environment templates (`.env.local`) and configure Clerk, Supabase, and Stripe variables.

### 2. Run the Desktop Shell (Tauri)
```bash
# Install dependencies
npm install

# Run in Tauri dev mode (launches Next.js + local proxy + desktop view)
npm run tauri dev
```

### 3. Run Web Interface Only
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the web dashboard.

---

## 🔒 Security Assurance: Zero-Leak BYOK Architecture
Ceil is engineered so that your secret keys never touch Vercel, cloud servers, or local storage:
- **OS Credential Manager**: Your keys are saved directly into macOS Keychain or Windows Credential Manager.
- **On-the-Fly Injection**: Your codebase uses placeholder keys (like `sk-placeholder-key`) pointing to our local proxy `http://localhost:9999/v1`. The local proxy injects the real key on-the-fly.
- **Vercel Static Export**: If deployed to Vercel, the app exports as a static web interface that connects *locally* to the proxy on your loopback address. No keys are ever transmitted upstream.

For details, see [**LOCAL_SETUP.md**](file:///C:/0_Antigravity%20Template/Codelab_Antigravity/5_AI%20API%20Cost%20&%20Quota%20Dashboard/app_build/LOCAL_SETUP.md).
