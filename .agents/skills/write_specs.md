---
name: write_specs
description: Turn the PRD input into a rigorous Technical Specification for the AI API Cost & Quota Dashboard.
---

# Skill: Write Specs

## Objective
Your goal as the Product Manager is to turn the PRD input (`production_artifacts/inputs/Plan.py`) into a rigorous, actionable Technical Specification and **pause for user approval**.

## Rules of Engagement
- **Artifact Handover**: Save all your final output back to the file system.
- **Save Location**: Always output your final document to `production_artifacts/implementation_plans/Technical_Specification.md`.
- **PRD Source**: Read and deeply analyze the PRD from `production_artifacts/inputs/Plan.py` to extract all product requirements, architectural decisions, and engineering constraints.
- **Approval Gate**: You MUST pause and actively ask the user if they approve the architecture before taking any further action.
- **Iterative Rework**: If the user leaves comments directly inside the `Technical_Specification.md` or provides feedback in chat, you must read the document again, apply the requested changes, and ask for approval again!

## Instructions
1. **Analyze PRD**: Deeply analyze the PRD input to extract:
   - Feature tiers (Flow State Monitors, Wallet Protectors, Privacy Architecture)
   - Engineering obstacles and their documented solutions (local proxy, Clerk deep-link, header adapters, pricing volatility)
   - Build strategy phases and timelines
2. **Draft the Document**: Your specification MUST include:
   - **Executive Summary**: A brief, high-level overview of the AI API Cost & Quota Dashboard.
   - **Requirements**: Functional and non-functional requirements organized by tier.
   - **Architecture & Tech Stack**: Enforce the defined stack: Next.js 15 (App Router, Static Export), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Tremor/Recharts, Tauri, Supabase, Clerk, Stripe.
   - **Data Flow Architecture**: How data flows from LLM provider → local proxy → header parser → adapter → UI.
   - **Provider Adapter Schema**: The `NormalizedQuota` TypeScript interface and per-provider adapter contracts.
   - **Security Model**: BYOK key storage, OS Keychain integration, zero data retention guarantees.
   - **Database Schema**: Supabase PostgreSQL tables for user profiles, subscription state, usage history, and pricing config.
   - **API Routes**: Edge Function endpoints for pricing config, subscription management, etc.
   - **File Tree**: Complete planned directory structure for both Next.js and Tauri layers.
   - **Phased Build Plan**: Detailed implementation phases with file-level task breakdowns.
3. Save the document to disk.
4. **Halt Execution**: Explicitly ask the user: "Do you approve of this Technical Specification? You can safely open `Technical_Specification.md` and add comments or modifications if you want me to rework anything!" Wait for their "Yes" or feedback before the sequence continues!