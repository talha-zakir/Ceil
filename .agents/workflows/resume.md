---
description: Resume the development cycle from the last saved state in .agents/memory/
---

When the user types `/resume`, orchestrate the recovery process using `.agents/memory/` and the appropriate skills.

### Execution Sequence:
1. **Context Recovery**: Read `.agents/memory/handover.md` and `.agents/memory/log.md` to load the project state, goals, tech stack, and last active step.
2. **Sync Status**: Report a summary of the recovered project context to the user (e.g., "Resuming development of Chat App. Active Step: Scaffolding. Next Action: Build client components").
3. **Branch Sequence**:
   - If the active step is **PM (Spec Drafting)** or **Approval**: Act as the **Product Manager**, load `write_specs.md`, and resume the spec/approval phase.
   - If the active step is **Engineer (Code Generation)**: Act as the **Full-Stack Engineer**, load `generate_code.md`, and generate/update the codebase.
   - If the active step is **QA (Audit)**: Act as the **QA Engineer**, load `audit_code.md`, and inspect/fix current code in the target build folder.
   - If the active step is **DevOps (Hosting / Deploy)**: Act as the **DevOps Master**, load `deploy_app.md` or `deploy_cloud_run.md`, and run the build/deploy step.
   - If the active step is **Completed**: Ask the user what new features or ideas they want to tackle next!
