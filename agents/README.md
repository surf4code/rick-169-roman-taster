# Agent kit (Antigravity / Gemini, Claude Code, or any CLI agent)
Work in this repo only. Hand off through files, not chat. Read in this order: `AGENTS.md`, `docs/MIKO_BIBLE.md`, `HANDOFF.md`.
Pipeline for a 30 s preview (then the same loop for 21 min):

1. `01_DIRECTOR.md`   -> shot list JSON for the script
2. `02_CASTING.md`    -> character sheet (look, outfit, hair, face per character)
3. `03_DIALOGUE.md`   -> exact voice lines + timing (voice is generated from the exact script)
4. `04_SET_DESIGNER.md` -> sets + props + colour mood per scene
5. `05_ANIMATOR.md`   -> gestures, face, camera in the Remotion/Three code
6. `06_RENDERER.md`   -> push render, collect artifact
7. `07_QA_COMPARER.md`-> measures + LOOKS at the video vs Miko; FAIL = send back to the owner of the problem

Loop: Director -> (Casting, Dialogue, Set) -> Animator -> Renderer -> QA. QA never fixes; it only reports to HANDOFF.md.
Rule: a different agent/model must do QA than the one that built the shot.
