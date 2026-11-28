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
3. **Zero Paid Services, Zero Affiliates, Zero Closing CTA:** Never use ElevenLabs, Higgsfield, OpenArt, or paid packs. Strip all affiliate links and closing CTAs. Use Gemini API for TTS voiceovers and painted backdrops, plus included GLBs, free CC0 models (Poly Haven, Kenney, Quaternius), or code-built Three.js primitives.
4. **Format Lock:** `1920x1080`, `30 fps`, `16:9`, H.264 (`yuv420p`), mastered audio at `-14 LUFS` (`TP <= -1.5 dBTP`).
5. **Character Consistency Is Priority #1:** Maintain one single `src/data/characters.json` and shared rig code. Fixed head shape, skin color, body color, role-coded outfit accent, and expression set per character. Never regenerate characters per shot. Re-run the side-by-side character expression contact sheet test after every change.
6. **QA Images Are Real Renders Only:** Every QA still, contact sheet or side-by-side must come from `remotion still`/`remotion render`. Pillow or hand-drawn mock-ups are forbidden as QA evidence. If a render cannot be run, say so and give the exact command instead.
7. **Warm Bright Colour Grade (Ricks Clips Target):** Luminance mean `0.45-0.55` (day) or `0.36-0.48` (torch-lit night), saturation `0.40-0.65`, warm key light (`#FFF1D6`), soft blue-violet only in shadows (`#6B7DB3`), clean highlights, minimal vignette (`darkness <= 0.12`). Night scenes are lit by warm lamps/torches, never overall dark blue or muddy brown. Never copy Miko's dark grade.
8. **Akira Host Rule:** Akira is the narrator/host on a flat sage-green backdrop (`#9CAF88`), about 1 cutaway per 2-3 minutes, fixed 5 expressions (`deadpan`, `smirk`, `shout`, `wide-eyed`, `big_grin`). Ask once for the user's Akira design image; use a placeholder until provided.
9. **Historical Accuracy:** Verify every historical claim with web search and cited sources. Mark anything uncertain as `[UNCERTAIN]`. Never invent history.

## Reference Modules

- `references/writing-bernard-yt.md`: Bernard narration rules (ignoring only "no clothes"), monetisation-safe wording table, 10-beat structure, Akira cutaways, YouTube Studio hooks/retention/packaging.
- `references/visual-rig-and-grade.md`: Ricks Clips visual target, fixed `characters.json`, 16-emotion rig, mandatory character consistency sheet test, `colorGrade.ts`, `PostFX`, `AtmosphereFX`, and Miko-borrowed overlays.
- `references/camera-zack-motion.md`: Zack-D-Films `anim.ts` helpers, 2-4 s shot pacing, punch-ins, whip pans, low angles, slow-motion impacts, fly-throughs.
- `references/audio-render-qa.md`: Gemini TTS/backdrop scripts, `analyze_audio.py`, `check_timeline.py`, `qa_video.py`, single-shot benchmark, and `.github/workflows/render-matrix.yml` (max 40 parallel jobs).

## Gated 5-Phase Workflow

- **Phase 0:** Build `rick-169` skill + source audit.
- **Phase 1:** Style Test (60-90 s opening + Akira cutaway + infographic + macro prop insert + Character Consistency Sheet + Ricks Clips side-by-side + seconds/frame benchmark).
- **Phase 2:** Cited historical research + Story Bible + ~3,300-word Bernard script + monetisation-safe scan.
- **Phase 3:** Gemini TTS voice + faster-whisper word timestamps + full shot list JSON + `check_timeline.py` + storyboard stills.
- **Phase 4:** 40-job GitHub Actions parallel render + ffmpeg concat + `-14 LUFS` mux + `qa_video.py` + Title/Thumbnail/Description (with fictional dramatization disclaimer, zero affiliates, zero closing CTA).
