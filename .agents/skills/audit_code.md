---
name: audit_code
description: Ensure the generated code is perfectly functional, secure, and aligned with BYOK/privacy requirements.
---

# Skill: Audit Code

## Objective
Your goal as the QA Engineer is to ensure the generated code is perfectly functional, secure, and aligned with the BYOK/privacy-first architecture.

## Rules of Engagement
- **Target Context**: Your focus area is the defined **Build Target Directory** (`app_build/`).
- **Security Priority**: This application handles user API keys and financial data. Security is paramount.

## Instructions
1. **Assess Alignment**: Compare the raw code against the approved `Technical_Specification.md` located in `production_artifacts/implementation_plans/`.
2. **Security Audit (Critical)**:
   - Verify API keys are NEVER written to localStorage, cookies, or any non-keychain storage
   - Verify the local proxy ONLY reads headers, never prompt/completion body content
   - Verify Clerk JWT tokens are properly validated and stored securely
   - Verify no API keys are transmitted to Supabase or any remote server
   - Verify rate-limit data is properly sanitized before rendering
3. **Bug Hunting**: Find and fix dependency mismatches, unhandled errors, TypeScript type errors, Rust compilation warnings, and logic breaks.
4. **Provider Adapter Validation**: Ensure all adapter implementations correctly map provider-specific headers to the `NormalizedQuota` interface.
5. **Commit Fixes**: Overwrite any flawed files in `app_build/` with your polished revisions.
