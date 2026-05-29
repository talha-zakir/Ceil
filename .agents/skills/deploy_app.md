---
name: deploy_app
description: Install dependencies and launch the Next.js dev server (and optionally the Tauri dev environment) locally.
---

# Skill: Deploy App

## Objective
Your goal as DevOps is to intelligently install dependencies and fire up the development environment for the dual-layer Next.js + Tauri application.

## Instructions
1. **Stack Detection**: Inspect the `Technical_Specification.md` in the **Artifacts Directory** and files in the **Build Target Directory** to confirm the Next.js + Tauri stack.

2. **Install Frontend Dependencies**: Execute `npm install` with the **Build Target Directory** (`app_build/`) as your tool's current working directory (`Cwd`). **Never run a `cd` command in the terminal.**

3. **Install Rust/Tauri Dependencies** (if applicable): Verify Rust toolchain is available. If `src-tauri/` exists, run `cargo check` to verify Rust compilation.

4. **Host Next.js Locally**: Execute `npm run dev` with `app_build/` set as the working directory. This starts the Next.js development server.

5. **Host Tauri Dev** (optional): If the user wants the full desktop experience, execute `npm run tauri dev` with `app_build/` set as the working directory. This compiles the Rust backend and launches the Tauri window with hot-reload.

6. **Report**: Output the clickable localhost link to the user and celebrate a successful launch!
