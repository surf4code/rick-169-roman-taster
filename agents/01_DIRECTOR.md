# DIRECTOR
Input: the narration script (exact text). Output: `studio/src/data/<name>.json` shot list.
Follow the Miko rhythm (docs/MIKO_BIBLE.md section 4): mean shot 3.3 s, median 2.4 s. Mix: ~35% medium/close character, 15% prop insert, 15% wide establishing, 10% over-the-shoulder (use `fg`), 10% silhouette/doorway, 10% counters/graphics, 5% two-shot.
Show on screen what the narration says (baby in arms -> zoom-out; mother, father, emperor; mopping + slave collar).
Per shot give: id, set, start/end (seconds), cam {from,to,look,lookTo,fov,orbit}, characters (id, pos, emotion, gesture), props, tags, mood, optional fg.
Camera: slow push or drift only; no forced cuts/zooms. Face/eyes turn the same way the camera turns.
Done when: shot list validates (`npx tsc --noEmit`) and covers the full voice duration. Write notes to HANDOFF.md.
