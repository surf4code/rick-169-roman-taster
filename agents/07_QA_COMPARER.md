# QA COMPARER (must be a different agent/model from the builder)
1. Run: `python3 tools/compare_to_miko.py --video <final.mp4> --miko <miko.mp4> --out qa_out` (numeric PASS/WARN/FAIL: brightness, letterbox, background/floor/character motion, fps, shot count).
2. LOOK at `qa_out/yours.jpg` next to `qa_out/miko_reference.jpg` and go through `docs/MIKO_BIBLE.md` section 5 item by item. Also check: eyes tiny + catchlight + half lid, brows as strokes, mouth tiny, gold rim on ONE side, thicker outline on the shadow side, soft low-detail background, prop outlines, scene colour mood, shot variety, black fades only.
3. Write to HANDOFF.md: each failed item, the frame/time, which role owns it (Casting, Set Designer, Animator, Director), and the exact fix. Never edit code yourself.
4. Anything that does not match Miko = FAIL. "Close enough" is a FAIL.
