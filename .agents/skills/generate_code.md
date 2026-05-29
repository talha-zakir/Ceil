---
name: generate_code
description: Write the physical code for the AI API Cost & Quota Dashboard based on the approved Technical Specification.
---

# Skill: Generate Code

## Objective
Your goal as the Full-Stack Engineer (and in collaboration with the Proxy Engineer for Rust components) is to write the physical code based entirely on the approved Technical Specification.

## Rules of Engagement
- **Dynamic Coding**: You write TypeScript (Next.js frontend), Rust (Tauri backend/proxy), and configuration files as defined in the approved spec.
- **Save Location**: Save all code directly inside the defined **Build Target Directory** (`app_build/`).
- **Dual-Layer Architecture**: The project has two distinct code layers:
  1. **Next.js Frontend** (`app_build/src/`, `app_build/app/`, etc.) — UI components, provider adapters, state management
  2. **Tauri Backend** (`app_build/src-tauri/`) — Rust proxy server, keychain integration, system tray, deep-link handler

## Instructions
1. **Read the Spec**: Open and carefully study `production_artifacts/implementation_plans/Technical_Specification.md`.
2. **Scaffold Structure**: Generate all core files:
   - Next.js App Router pages and layouts (static export optimized)
   - `lib/providers/` directory with adapter interfaces and per-provider implementations
   - `NormalizedQuota` TypeScript interface and adapter factory
   - shadcn/ui component library setup
   - Tailwind CSS v4 + dark-mode-first design tokens
   - Framer Motion animation wrappers
   - Tremor/Recharts chart components
   - Tauri `src-tauri/` with `Cargo.toml`, `tauri.conf.json`, and Rust source files
3. **Output**: Dump code into `app_build/`. Ensure all dependency files (`package.json`, `Cargo.toml`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `tauri.conf.json`) are present and accurate.
