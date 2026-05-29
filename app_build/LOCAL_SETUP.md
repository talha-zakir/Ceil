# 🔒 Ceil — Local Setup & Security Guide

This guide covers how to set up Ceil locally, run testing, and explains how our privacy-first architecture guarantees your LLM API keys **never leak**, even when the frontend is deployed to Vercel.

---

## 🚀 1. Local Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (for desktop shell compilation)

### Step 1: Clone & Configure Environment Variables
1. Copy the `.env.example` template to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and populate it with your development keys for **Clerk**, **Supabase**, and **Stripe** (see [`.env.example`](file:///C:/0_Antigravity%20Template/Codelab_Antigravity/5_AI%20API%20Cost%20&%20Quota%20Dashboard/app_build/.env.example)).

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Run the Development Servers

Ceil can be run in two modes:

#### Option A: Running the Tauri Desktop Application (Recommended)
This compiles both the local Rust proxy server (`localhost:9999`) and launches the React desktop interface:
```bash
# This automatically boots the Next.js frontend and compiles the Tauri shell
npm run tauri dev
```

#### Option B: Running the Web Interface Independently
If you want to debug the website layout directly inside a web browser:
```bash
npm run dev
```
*Note: To capture live request usage when running in a browser, the Ceil Desktop app must be running in the background to provide the local proxy socket (`localhost:9999`).*

---

## 🛡️ 2. Security Architecture: Zero-Leak API Key Design

Ceil is built using a **Bring-Your-Own-Key (BYOK)** model. We designed it so that your raw API keys are never stored on a server, database, or transmitted across the web.

Here is how we guarantee your keys never leak, even when running the frontend on Vercel:

### 1. OS-Native Keychain Storage (No Cloud Storage)
When you input your API keys in the settings panel of Ceil:
- The keys are sent via a secure Tauri IPC bridge directly to the **Rust Backend**.
- The Rust backend writes the keys to your system's **OS-Native Keychain** (Windows Credential Manager / macOS Keychain / Linux Secret Service) using the OS APIs.
- Your keys are **never saved** in `localStorage`, cookies, or remote databases.

### 2. On-The-Fly Key Injection (Local Proxy)
To track rate limits and token usage, Ceil spins up a local proxy server at `http://localhost:9999` on your computer.
- You configure your local developer scripts or backend servers to use `http://localhost:9999` as the `base_url`:
  ```python
  from openai import OpenAI
  
  client = OpenAI(
      base_url="http://localhost:9999/v1",
      api_key="sk-placeholder-key" # Use a placeholder key!
  )
  ```
- Your code uses a **placeholder key** (`sk-placeholder-key`).
- When the request hits the local Ceil proxy:
  1. The Rust proxy intercepts the request.
  2. It pulls the real, secure API key from your local OS Credential Manager.
  3. It replaces the placeholder header on-the-fly with the real API key.
  4. It forwards the request to the upstream LLM provider (e.g., `api.openai.com`).
  5. It parses the returning rate-limit headers to update the dashboard.
- The real API key **never leaves your local machine** until it travels directly from the proxy to the LLM provider over HTTPS.

### 3. Vercel Static Deployments
If you deploy the Ceil website to Vercel:
- The build targets **Static Export mode** (`output: 'export'`). This means Vercel only serves pre-built, static HTML, JS, and CSS files. There is no Next.js Node.js server running in the cloud to process requests.
- When you load the Ceil dashboard from a Vercel URL, it attempts to connect to `http://localhost:9999` on your loopback address.
- Since `localhost` resolves to **your own computer**, the static webpage communicates directly with the local proxy running in your native desktop background.
- Because key injection and proxying happen entirely on **your machine**, Vercel has zero access to your keys, and no key data is ever transmitted to the cloud.

---

## 🧪 3. Testing Your Local APIs
To test the end-to-end integration:
1. Open Ceil Settings, input your LLM provider API key, and click **Test Connection** followed by **Save Key**.
2. Start the Ceil proxy.
3. Send a request to `localhost:9999` using curl or your preferred LLM client:
   ```bash
   curl http://localhost:9999/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk-placeholder" \
     -d '{
       "model": "gpt-5.5-instant",
       "messages": [{"role": "user", "content": "Hello Ceil!"}]
     }'
   ```
4. Observe the **Demo Mode** toggle in the Ceil header. Turn it **OFF** to watch your actual request logs, token usage, and daily budgets update in real-time on the dashboard!
