---
description: Start the Autonomous AI Developer Pipeline sequence with a new idea
---

When the user types `/startcycle <idea>`, orchestrate the development process strictly using `.agents/agents.md` and `.agents/skills/`.

### Execution Sequence:
1. **Initialize Memory**: Act as the PM, use `sync_memory.md` to initialize `.agents/memory/handover.md` with the new project idea, stack, and active step.
2. **Draft & Approve Spec**: Act as the **Product Manager** and execute the `write_specs.md` skill using the `<idea>`.
   *(Wait for the user to explicitly approve the spec. If the user provides feedback, revise the document. Loop this step until they type "Approved").*
   Once approved, execute the `sync_memory.md` skill to mark the spec phase as completed and set the active step to **Engineer**.
3. **Design & Build UI**: Shift context, act as the **UI/UX Designer**, collaborate with the **Full-Stack Engineer** to execute the `generate_code.md` skill focusing on stunning UI components.
4. **Generate Code**: Shift context, act as the **Full-Stack Engineer**, complete the backend/frontend logic, and then execute `sync_memory.md` to update the list of modified files and set the active step to **QA**.
5. **Audit Code**: Shift context, act as the **QA Engineer**, execute the `audit_code.md` skill, apply fixes, and then execute `sync_memory.md` to update progress and set the active step to **DevOps**.
6. **Deploy**: Shift context, act as the **DevOps Master**, execute the `deploy_vercel.md` (and optionally `deploy_app.md` for local testing) skill, and finally run `sync_memory.md` to mark the entire pipeline sequence as completed.
