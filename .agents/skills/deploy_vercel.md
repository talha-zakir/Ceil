---
name: deploy_vercel
description: Deploy the web-only version of the dashboard to Vercel (for the Clerk auth landing page and pricing config hosting).
---

# Skill: Deploy to Vercel

## Objective
Your goal as DevOps is to deploy the web-facing components to Vercel. Note: The primary product is a Tauri desktop app, but Vercel hosts:
1. The Clerk authentication landing page (for deep-link JWT handshake)
2. The dynamic `pricing.json` configuration endpoint
3. The marketing/landing page

## Instructions
1. **Verify Environment**: Ensure the Next.js application is properly built or configured in the **Build Target Directory** (`app_build/`). Confirm `next.config.ts` has `output: 'export'` for the desktop build, but the Vercel deployment should use standard SSR mode.
2. **Vercel CLI**: Use the `vercel` CLI to deploy. Execute `vercel --yes` or `npx vercel --yes` with `app_build/` as your tool's current working directory (`Cwd`). **Never run a `cd` command in the terminal.**
3. **Environment Variables**: Ensure Supabase URL/Key, Clerk publishable key, and Stripe publishable key are configured in Vercel's environment settings.
4. **Wait for Build**: Monitor the deployment logs.
5. **Report**: Output the live production Vercel URL to the user!
