---
description: Manually trigger a memory sync to save mid-phase progress before clearing the chat context.
---

When the user types `/sync`, immediately pause current development tasks and orchestrate a memory update.

### Execution Sequence:
1. **Trigger Memory Sync**: Execute the `sync_memory.md` skill to evaluate everything discussed and accomplished in the current chat window.
2. **Update Artifacts**: Update `.agents/memory/handover.md` with the latest micro-decisions, current bugs, or partial code progress that happened mid-phase. Append the action to `.agents/memory/log.md`.
3. **Report to User**: Output a success message confirming that the state is saved and it is safe for the user to close the chat, open a new window, and type `/resume`.
