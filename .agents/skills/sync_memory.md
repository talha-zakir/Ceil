---
name: sync_memory
description: Read and write context memory to prevent context loss and allow seamless handovers.
---

# Skill: Sync Memory

## Objective
Maintain the persistent project memory inside `.agents/memory/handover.md` and `.agents/memory/log.md`. This allows developers or subsequent agent runs to resume precisely from where the last session left off.

## Instructions
Execute this skill whenever:
1. An agent transitions to another agent (e.g., PM transitions to Full-Stack Engineer).
2. A significant architectural decision is made (e.g., switching from SQLite to PostgreSQL).
3. The user requests a status check or wishes to pause development.

### Steps:
1. **Load Current State**: Read `.agents/memory/handover.md` and `.agents/memory/log.md` to understand existing project context.
2. **Determine Changes**: Identify what tasks have been completed, what decisions were made, and what files were modified since the last update.
3. **Update Handover**:
   - Update **Current Pipeline State** (e.g., change Active Step, adjust timestamp).
   - Check off completed steps in the **Progress Checklist**.
   - Update **Architectural & Key Decisions** with any new choices and their rationales.
   - List newly created/modified files.
   - Outline the **Next Actions** clearly.
4. **Append to Log**:
   - Add a new row to the markdown table in `.agents/memory/log.md` detailing the time, the active agent, the action taken, and the outcome.
5. **Verify**: Save the files back to `.agents/memory/`. Ensure they remain well-structured and human-readable.
