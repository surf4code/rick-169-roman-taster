---
name: rick-169
description: End-to-end 16:9 2.5D animated history video production engine combining Bernard-style second-person scripts and Akira host cutaways, Ricks-Clips-style warm bright bean-head stickmen in 3D toon sets, Zack-D-Films dynamic camera helpers, Miko-style floating tags and infographics, Gemini API voice and backdrops, GitHub Actions parallel rendering, and automated timeline/video QA gates. Use whenever the user asks to create, plan, script, style-test, or render a 16:9 animated history or "Why It Sucks to Be..." explainer video.
---

# rick-169

Production skill for 16:9 (`1920x1080`, `30 fps`) animated history videos uniting four layers into one Remotion + Three.js pipeline: Bernard-style second-person storytelling with host Akira, Ricks-Clips-style warm bright 2.5D toon visuals, Zack-D-Films dynamic camera energy, and selective Miko-style overlays (floating role/counter tags, infographic cards, and macro prop inserts).

## When to Use

- Creating a new `Why It Sucks to Be [Role] (in [Place/Era])` animated history film in 16:9.
- Running a 60-90 second style test compared side by side against Ricks Clips reference frames.
- Writing a researched, monetisation-safe Bernard-style narration script (~3,300 words) with YouTube Studio hooks and retention loops.
- Generating Gemini API TTS audio, faster-whisper word timestamps, fixed character rigs, shot lists, or GitHub Actions parallel render workflows.

## Non-Negotiable Production Rules

1. **Language Split:** Converse with the user in Hinglish when requested. Keep all narration scripts, on-screen labels, speech bubbles, captions, prompts, titles, descriptions, and code in English. Ask at most one question at a time.
2. **API Key Security:** Never print, hardcode, store in files, or commit API keys. Always read `GEMINI_API_KEY` from the environment (`os.environ["GEMINI_API_KEY"]` or `process.env.GEMINI_API_KEY`).
3. **Zero Paid Services, Zero Affiliates, Zero Closing CTA:** Never use ElevenLabs, Higgsfield, OpenArt, or paid packs. Strip all affiliate links and closing CTAs. Use Gemini API for TTS voiceovers and painted backdrops, plus included CC0/code-built 3D props (Poly Haven, Kenney, Quaternius, or Three.js primitives).
4. **Format Lock:** `1920x1080`, `30 fps`, `16:9`, H.264 (`yuv420p`), mastered audio at `-14 LUFS` (`TP <= -1.5 dBTP`).
5. **Character Consistency Is Priority #1:** Maintain one single `src/data/characters.json` and shared rig code. Fixed head shape, skin color, body color, role-coded outfit accent, and expression set per character. Never regenerate characters per shot. Re-run the side-by-side character expression contact sheet test after every change.
6. **Warm Bright Colour Grade (Ricks Clips Target):** Luminance mean `0.45-0.55` (day) / `0.36-0.48` (torch-lit night), saturation `0.40-0.65`, warm key light (`#FFF1D6`), soft blue-violet only in shadows (`#6B7DB3`), clean highlights, minimal vignette (`darkness <= 0.12`). Night scenes are lit by warm lamps/torches, never overall dark blue or muddy brown. Do NOT copy Miko's dark grade.
7. **Akira Host Rule:** Akira is the narrator/host on a flat sage-green backdrop (`#9CAF88`), ~1 cutaway per 2-3 minutes, fixed 5 expressions (`deadpan`, `smirk`, `shout`, `wide-eyed`, `big_grin`). Ask once for the user's Akira design image; use a placeholder until provided.
8. **Historical Accuracy:** Verify every historical claim with web search and sources. Mark anything uncertain `[UNCERTAIN]`. Never invent history.

## Reference Modules

Read only the reference file required for the active phase:

- `references/writing-bernard-yt.md`: Full Bernard narration rules (ignoring only its "no clothes" rule), monetisation-safe wording table, 10-beat ~21-minute structure, Akira cutaway rules, YouTube Studio hooks, open-loop retention ledger, and title/thumbnail/description packaging.
- `references/visual-rig-and-grade.md`: Ricks Clips visual target, fixed `characters.json` schema, 16-emotion `CutoutCharacter.tsx` rig, mandatory side-by-side character consistency sheet test, `colorGrade.ts` preset, `PostFX.tsx`, `AtmosphereFX.tsx`, and Miko-borrowed `FloatingRoleTag`, `InfographicCard`, and macro insert specs.
- `references/camera-zack-motion.md`: Zack-D-Films `anim.ts` helpers (`kf`, easings, 16:9 `cam169`, `place`, `shake`, `slowMoTime`, `ikArm`), 2-4 s shot pacing, punch-ins, whip pans, low angles, impact slow-mo, and fly-through transitions.
- `references/audio-render-qa.md`: Gemini TTS & backdrop scripts, `analyze_audio.py` (faster-whisper + librosa), `check_timeline.py` & `qa_video.py` QA gates, single-shot benchmark, and `.github/workflows/render-matrix.yml` (up to 40 parallel chunks + ffmpeg concat).

## Gated 5-Phase Production Workflow

Stop and show results to the user after EVERY phase before proceeding.

### Phase 0: Skill Build and Asset Audit

1. Verify `rick-169` (`SKILL.md` + `references/` + `scripts/` + `.github/workflows/render-matrix.yml`).
2. Audit available assets (16 base GLBs if supplied, Akira reference image or placeholder, `GEMINI_API_KEY` env var).
3. Summarize what was kept, removed, and added from each source skill.

### Phase 1: Style Test (60-90 Seconds)

1. Build shared `characters.json`, fixed rig, warm bright grade preset, and Zack 16:9 camera helpers.
2. Run the side-by-side **Character Consistency Sheet Test** (all characters x all expressions).
3. Render a 60-90 s opening (birth + role transition) featuring at least 1 Akira cutaway, 1 floating role tag, 1 infographic card, and 1 macro close-up prop insert.
4. Benchmark one shot first and report `seconds/frame`.
5. Deliver a contact sheet and a side-by-side comparison vs Ricks Clips frames (with measured luminance/saturation stats). Wait for approval.

### Phase 2: Historical Research and Full Script

1. Research with cited web sources; mark any uncertain claim `[UNCERTAIN]`.
2. Build the Story Bible (role accent colors, cast, sets, foreign term, motif prop) + Open-Loop Ledger.
3. Write the ~3,300-word Bernard-style script (`You're born in...`, 2nd person present, dry humor arc, Akira cues).
4. Run the monetisation-safe wording scan. Wait for approval.

### Phase 3: Voice, Timestamps, Shot List, and Storyboard

1. Generate narration via `scripts/gemini_tts.py` (`GEMINI_API_KEY` from env).
2. Extract word timestamps & RMS lip-sync envelope via `scripts/analyze_audio.py`.
3. Build full `shots.json` (new shot every 2-4 s across wide, top-down, macro prop, over-shoulder, close-up, Akira, infographic).
4. Pass `python3 scripts/check_timeline.py src/timeline.json` with zero ERRORs.
5. Render storyboard stills for key scenes. Wait for approval.

### Phase 4: Parallel Render, QA Gates, and Packaging

1. Split frames across up to 40 parallel GitHub Actions jobs (`.github/workflows/render-matrix.yml`), render chunks, and concat via `ffmpeg`.
2. Master audio to `-14 LUFS` and run `python3 scripts/qa_video.py out/final.mp4 --out out/qa/ --beats src/timeline.json`.
3. Deliver 3 title options, 3 thumbnail concepts, accurate tags, and YouTube description with `"This video is a fictional dramatization inspired by historical accounts..."` (zero affiliate links, zero closing CTA).

## Gotchas

- **Override Bernard "No Clothes":** Always dress characters in vibrant Ricks-Clips role-coded outfits so roles read at a glance.
- **Reject Miko Dark Grade:** Only borrow Miko's floating tags, infographic cards, and macro prop inserts.
- **Strict Determinism:** Never call `Math.random()` inside render frames; use `mulberry32(seed)` indexed by `frame` so parallel CI chunks stitch cleanly.
- **Headless WebGL Stability:** Keep `<EffectComposer multisampling={0}>`, `DepthOfField height={360}`, and `--gl=swangle` on CPU CI runners.
