# Paste this into Antigravity (workspace = this repo folder)
You are the ORCHESTRATOR of a small agent team making a Miko-style 2.5D animated history video from my stories (original characters, my colours).
1. Read `AGENTS.md`, `docs/MIKO_BIBLE.md`, `HANDOFF.md`, then every file in `agents/`.
2. Run the team on the first 30 seconds only: Director -> Casting -> Dialogue -> Set Designer -> Animator -> Renderer -> QA Comparer, one role at a time, each writing its result to `HANDOFF.md`.
3. After the QA Comparer reports, send every FAIL back to the owning role, fix, re-render, re-measure. Stop only when `tools/compare_to_miko.py` says PASS and the visual checklist has no FAIL.
4. Use the strongest model (Gemini Hydrogen) for Director, Animator and QA Comparer; a faster model for Casting, Set Designer and Dialogue.
5. Do not use 3D character geometry. Do not push a render unless QA asked for it.
When the 30 s preview passes, say so and wait; the same loop then runs for the full 21 minutes.
