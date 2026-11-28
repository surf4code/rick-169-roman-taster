# AGENTS.md: handoff for multi-agent work on the Miko-style video

Project: 16:9 history video "Why It Sucks to Be a Royal Food Taster (in Ancient Rome)", host Akira, about 1347 s.
Look: MIKO (flat 2D outlined cutouts in a soft, low-detail, moody perspective diorama) in warm colours.
READ FIRST: `docs/MIKO_BIBLE.md` (measured numbers + checklist) and `docs/miko-ref/*`.

## Roles (one agent each; hand off through files, never through chat)
1. ANALYST (Gemini / Antigravity is fine): studies the Miko video, updates `docs/MIKO_BIBLE.md` with measured numbers. Never edits code.
2. DIRECTOR (Claude): turns the script into a shot list: `studio/src/data/*.json` (shot type, set, camera from/to, characters, props, tags, mood). Follows Bernard-style script, Miko-style shot variety.
3. SET BUILDER (cheap/free model OK): builds low-detail outlined sets in `studio/src/components/sets` and props in `components/props`.
4. CHARACTER ANIMATOR (Claude): `CharacterSvg.tsx`, `CutoutCharacter.tsx`: face, rim light, gestures.
5. RENDERER (script only): push `render-request.json`; GitHub Actions renders 60 fps and 30 fps.
6. QA (a DIFFERENT agent from whoever made the shot): renders stills, runs `tools/pairdiff.py`, compares side by side with Miko frames, and writes PASS/FAIL against section 5 of the Bible. A FAIL means regenerate.

## Hard rules
- Do not touch another role's files without a note in `HANDOFF.md`.
- No 3D character geometry. Characters are flat cutouts.
- Black fade only, Miko plate format, letterbox about 6%.
- Time-based animation only (works at 30 and 60 fps).
- Keep the voice script text exactly as in `rick-169/`.

## Commands
- Local still: `cd studio && npx remotion still src/index.ts First20MikoV2 out/x.png --frame=N --gl=swangle`
- Motion check: `python3 tools/pairdiff.py <dir> <frames...>` (renders p<N>.png and p<N+1>.png first).
- Full render: bump `rerun` in `render-request.json` and push to main.

## Model hints
- Free Gemini via Antigravity: ANALYST, SET BUILDER (simple TSX), shot-list drafts.
- Claude Code (stronger): DIRECTOR, CHARACTER ANIMATOR, QA review.
- OpenRouter / NVIDIA NIM models: bulk work like prop variations, captions; always QA'd by the QA role.
