---
name: cartoon-3d-short
description: Make a 16:9 (1920x1080) LONGFORM cartoon story video for YouTube (~8-12 min, built as ~60 s chapters) in the "2D characters in a colourful 3D world" style (flat bean-head cartoon cards with ink outlines, painted 3D town/world with black ink lines, saturated sky, depth-of-field backgrounds, gliding cameras, voice narration, synthesized SFX + march-style music), rendered with three.js inside Remotion. Proven on "The Bridge That Fell for a Song" (2026-10-31). Use when the user asks for a longform / 16:9 / landscape / YouTube cartoon video, or another video "like the bridge video", "like the soldiers/bridge short", "in that cartoon 3D style", a history/science story short with cartoon characters in 3D, or says "use the cartoon short skill".
---

# Cartoon 3D story video, 16:9 longform (three.js + Remotion)

Proven example: **The Bridge That Fell for a Song**. It is an original 67 s short about the 1831 Broughton bridge and 74 soldiers marching in step. It was proven as a 1080x1920 vertical short; this edition of the skill has the same engine switched to **16:9 landscape (1920x1080)** for longform YouTube videos built from ~60 s chapters. Read **Longform 16:9 format** below before planning anything.
- Code: `src/videos/bridge/` of your Remotion project (composition `BridgeShort`, now 1920x1080, 30 fps). For a longform video each chapter is its own copy: `src/videos/<name>_ch01/`, `..._ch02/`, ... with compositions `Ch01`, `Ch02`, ...
- Script, voice and sound: `~/bridge-short/`.
- Style research: `references/`.

The style reference is a channel studied privately (`references/`: STYLE_BIBLE.md, reports/*.md, frames/). **The references are 9:16 portrait shorts and are kept exactly as measured.** Use them for LOOK (colour, ink, lens, textures, characters, motion, pacing), never for portrait framing: when comparing a 16:9 frame against a reference frame, compare look and detail, not composition.
- Those videos are private study material. Never upload, publish or send them.
- Never copy their scripts, characters or shots. Story, characters and voice are always OUR OWN.
- Never say the channel's name in a voice-over or description.

User rules that apply:
- Captions: the original author used none. **In this 16:9 longform edition word-by-word captions are ON** (see Longform 16:9 format). No other labels or on-screen text.
- English only (unless the user asks for another language; then voice, words.json and captions all use it).
- Voice: one steady tone.
- Jokes are researched real facts.
- Standard mix: music +3 dB, SFX -6 dB, voice unchanged.
- Final export 2K landscape: 2560x1440, `--scale 1.3333` (composition 1920x1080 x 1.3333).
- Opus max verifies every check (if no Opus sub-agents are available, use the substitute in Longform 16:9 format, section F).
- Save after every step.
- "Just do it" once the script is approved.

## Longform 16:9 format (read this first)

This edition renders **1920x1080 (16:9), 30 fps**, final export **2560x1440** (`--scale 1.3333`). A longform video is **8-12 min** built from **8-12 chapters of ~55-70 s**, every chapter being the same kind of unit the bridge short was.

**A. Pixel basis.** The frame is the old 1080x1920 portrait frame rotated: same pixel count, so every "px at 1080p" number in this skill (ink 5.1/3.3 px, lens cInf 4-16 px, bloom, card rim, grain) now means **px at 1920x1080** and scales with `output height / 1080`. The code in `templates/bridge/` already does this (Bridge.tsx, ink.ts, lensblur.ts, cast.ts, cardshade.ts). Never reintroduce `/ 1920`.

**B. Re-compose, don't just crop.** The engine is converted, but the bridge `story.ts` cameras were framed for a tall frame. For every new chapter:
- The vertical FOV is unchanged, so the **horizontal view is ~3.2x wider** than portrait: check that the world fills the width (no void or skybox seam at the left/right edge), crowds spread across the width, and the sight-line culler in `build.ts` still removes anything blocking each camera ray.
- Characters read best at **35-60 % of frame height** in mediums, 60-90 % in close-ups; two or three characters side by side now fit, use the width for staging (rule of thirds, eyes ~1/3 from the top, a leading look-room).
- Tall subjects (towers, bridges, falls) need a lower, wider camera or a tilt/crane glide instead of the portrait straight-on view.
- Keep every hold creeping, keep the 4-5 deg rolls, but roll less on wide establishing shots.
- All the references are 9:16: use them for look, not composition.

**C. Captions (ON).** Word-by-word from `words_chNN.json`: 2-4 words on screen, bottom-centre inside the lower-third safe area (bottom margin ~9 % of height), bold white with a thick dark stroke, the active word in a highlight colour, pop-in of 3 frames, never covering the characters' faces. Drawn as a Remotion overlay above the post stack (not inside the three.js composer).

**D. Chapters.**
- Write the WHOLE script first (facts with sources at the top of `SCRIPT.md`), get the user's OK, then split it into chapters at natural beats. Chapter 1 carries the hook; each chapter ends on a mini-cliffhanger or a callback; the last chapter carries the callback twist. Retention beats: a new reveal or visual change every 8-15 s.
- Each chapter: `SCRIPT_chNN.md`, `voice_chNN.wav`, `words_chNN.json`, `src/videos/<name>_chNN/` (a full copy of `templates/bridge/` with its own `story.ts`, `build.ts` layout and `Bridge.tsx`), composition id `ChNN`, `out/chNN/`.
- The world layout in `build.ts` depends on the cameras (sight-line culling), so each chapter keeps its own `story.ts`/`build.ts`. The **cast and look** must be identical everywhere: designate ch01 as master and run `bash scripts/sync_shared.sh <name> ch01` after any change to `toon.ts`, `cast.ts`, `cardshade.ts`, `shade.ts`, `lights.ts`, `grade.ts`, `ink.ts`, `lensblur.ts`, `paint.ts`, `world.ts`.
- Between chapters: 12-frame crossfade, or a hard cut on a big change of place or time. Voice, loudness and music key stay constant across the whole video.

**E. Linux / AWS / machines without a GPU.**
- `scripts/bridge-stills.mjs` picks the browser from `CHROME_PATH` or common Windows/Linux/macOS locations and the WebGL backend from `REMOTION_GL` (`angle` = GPU, default; `swangle` = software WebGL for AWS or any box without a GPU). Same look, much slower. `COMP=Ch03` selects the chapter composition.
- Chapter render: `bash scripts/render_chapters.sh Ch03 1.3333 swangle` (one chapter per machine, many machines in parallel). Optional frame split of one chapter: `--frames=0-449` and `--frames=450-899`, joined with `ffmpeg -f concat -safe 0 -i list.txt -c copy`.
- Join: `bash scripts/concat_chapters.sh out/final mix.wav out/ch01/video.mp4 out/ch02/video.mp4 ...` (picture concat, then mux with `-map 0:v:0 -map 1:a:0`).
- Always time a 60 s chapter render first, then size the number of machines. Set `REMOTION_TMP` on a big disk on every machine.

**F. Tools without ElevenLabs or Opus sub-agents.**
- Voice: Gemini TTS through a Google AI Studio key (`google-genai`; check the current TTS model name in the AI Studio docs; rotate keys if rate-limited), or Kokoro / Edge TTS. One voice id and one style prompt for the whole video. Word timings: `faster-whisper` with `word_timestamps=True`, saved as `words_chNN.json` (`{word, start, end}`), then hand-fixed as in step 3.
- No parallel sub-agents (e.g. Antigravity): do the cam / world / mat / char / post owner passes one after another in the sandbox copies. The "Opus max verifier" becomes: render stills, build side-by-side sheets with `sbs_sheet.py`, send them to the strongest multimodal model available (e.g. Gemini Neon in the Gemini app) for 0-10 scores plus a numbered fix list with frame numbers, apply, re-render stills.

**G. Order of work.** 1) topic + facts + full script + OK, 2) chapter split, 3) per chapter: voice -> words.json -> story.ts -> stills -> OK, 4) sync shared files, 5) render all chapters (parallel), 6) `short_qa.py` per chapter, 7) sound per chapter after picture timing is locked, master the whole, 8) concat + final QA, 9) deliver.

## Pipeline
1. **Topic and facts.** Pick one surprising true story with a physical cause and effect (it should be visual), plus a simple everyday analogy that explains it. For longform, pick a story with enough layers for 8-12 chapters (escalating events, a mystery, a rule it created), and plan the chapter list now.
   - Write the facts with their source at the top of `SCRIPT.md`.
2. **Script** (~3.7 words/s; the whole video is 8-12 min = ~1800-2600 words, written as chapters of 55-70 s = ~200-260 words each). The beat formula from the bridge short applies to every chapter AND to the whole video's arc:
   - **Hook:** the absurd fact in one line ("Seventy-four soldiers knocked down an iron bridge just by walking across it.").
   - **Setting:** year, place, pride.
   - **Action:** escalation over three or four beats, each a little bigger.
   - **Snap:** the moment it breaks.
   - **Deadpan double line:** "Luckily ... / Unluckily ...".
   - **Explanation:** one physics idea through an everyday analogy (the kid on a swing).
   - **Consequence:** the rule it created.
   - **Callback twist:** the ending.
   - Never describe on screen what the viewer already sees.
   - Longform: write the full script first, then split it into chapters (see Longform 16:9 format, D).
3. **Voice.** Record or generate `voice.wav` (one per chapter: `voice_chNN.wav`), then make its word timings `words.json` (`words_chNN.json`; any speech-to-text with word times; see Longform 16:9 format, F).
   - Put them in the project folder, e.g. `~/bridge-short/voice/`.
   - Hand-fix the word timings. Everything is timed to words.json.
4. **Shot plan** in `story.ts`: copy `templates/bridge/` (the final bridge source, same as `src/videos/bridge/` of your Remotion project) to `src/videos/<name>/` (longform: `src/videos/<name>_chNN/`, one per chapter), register a new composition next to `BridgeShort` in `src/Root.tsx` (1920x1080, 30 fps; longform: `Ch01`, `Ch02`, ...), and rename it.
   - `SHOTS`: id, a/b frames, light day/golden, crowd mode, `tau` story time.
   - `XFADE`: crossfades at place/time changes.
   - `FLASH_AT`: a white flash after the hook.
   - `CAMS`: per-shot keys `{f, dur?, cut?, s: f => {pos, look, fov, roll}}`.
   - `KICKS`: impact flip-shakes.
   - `DOF`/`dofAt`: lens blur per beat.
   - `FOREGROUND`: near framing props.
   - Every visual reaction lands 0-3 frames before its word.
5. **World.**
   - `lights.ts`: LIGHTS plus the LOOK sky/river/cloud palette per light.
   - `shade.ts`: two-tone shading and `untone()`.
   - `build.ts`: town, houses and Kenney CC0 kit props, recoloured, with sight-line culling of anything blocking a camera.
   - `paint.ts`: HD Canvas2D painted textures with seams painted in as dark tints.
   - `world.ts`: sky shader, fog = horizon colour, river, per-frame posing, sun frozen per shot and camera-relative.
6. **Characters.**
   - `toon.ts`: the Canvas2D `Pen` drawing API, 600x1000 design canvas, soles at y = 975, bean heads, stick limbs, plum variable-width outline, face library.
   - `cast.ts`: camera-facing billboards, crowds, effect cards, blinks, walk cycles. All billboards go on the `NOINK` layer.
   - `cardshade.ts`: cards lit by the scene light, no emissive.
7. **Post** (`Bridge.tsx` + `ink.ts` + `lensblur.ts` + `grade.ts`).
   - Composer order: ink → lens pre → lens main → bloom → NEUTRAL tone map → grade (MSAA 4).
   - Every pixel parameter scales with output height / 1920.
8. **Sound** (`~/bridge-short/audio/`: timeline.py, sfx_gen.py, sfx.py, music.py, instruments.py, dsp.py, mix.py).
   - Event table → synthesized SFX plus an original score ducked under the voice.
   - Output: mix.wav (48 kHz, exact length), stems and cues.md.
   - Lock the picture's time constants before the sound is made. Any later timing change means re-running the sound.
9. **Look checks.** Run `node scripts/bridge-stills.mjs out/<name>/x_ 100,400 0.5` (no GPU / AWS: `REMOTION_GL=swangle`; chapters: `COMP=Ch03`).
   - Set `BRIDGE_ENTRY=src/sandboxes/<n>/index.tsx` to render a sandbox copy.
   - Make side-by-sides against reference frames with `python scripts/sbs_sheet.py out.jpg --ours ... --ref ...`.
   - Send them to an Opus max verifier: 1-3 images, a ≤200-word verdict.
10. **Final render.**
    - `npx remotion render src/index.ts <Comp> out/<name>/video.mp4 --codec h264 --crf 16 --scale 1.3333` (no GPU / AWS: add `--gl=swangle --browser-executable=$(which chromium)`; or use `bash scripts/render_chapters.sh <Comp>`; longform: render every chapter, then `bash scripts/concat_chapters.sh ...`)
    - Mux with `-map 0:v:0 -map 1:a:0` (Remotion writes a silent audio track).
    - QA: `python scripts/short_qa.py final.mp4 out/<name>/qa shots.json` checks every frame for black, white, frozen and pop frames, plus loudness and sheets.
    - Fix anything it finds, then run a deep Opus audit.
11. **Deliver.** SendUserFile the final mp4, update memory, write notes.

## Final look values (bridge after 4 verifier rounds; all in `templates/bridge/`)
Start every new short from `templates/bridge/` (copy to `src/videos/<name>/`): the look lives in these values, the
story lives in story.ts / build.ts layout / cast.ts roles. Opus max scores at the end: colour day 7, golden 5-6,
lighting 5-6, ink 6, textures 5-6, characters 7, depth 6-7, composition 6-7 (from 5/3/4/5/4/7/4/6 at the start).
- **Light presets** (`lights.ts`, sun camera-relative and frozen per shot):
  - day: az 75 / el 48, lit [1.58,1.5,1.33], shade [.30,.29,.36], lift [.05,.06,.11] (cool tint ONLY in shade), sky
    top #3e7fd2 → horizon #b8d0ec, fog = horizon, 25→300 m, uSat 1.08, ~15 % blue haze past 60 m.
  - golden: az 6 / el 7 (backlit low sun), key toward #FFB36B ×1.5, violet-blue shade (facade ≈ #444380), sky
    #ffc47c → #8a6f8a, peach fog only past 50 m, sun disc #ffcf9e + bloom, contact blobs + real card shadows.
- **Albedos** (`paint.ts`/`build.ts`): muted brick / cream / ochre / terracotta houses with plinth, cornice, sills,
  hoods, door step, chimney + pot, heights 7 / 8.4 / 9.8 m; warm grey/beige stone (saturation −35 % from "storybook");
  ochre wood deck C* ~51-58 with near-black seams; iron dark and desaturated. Never lemon, never lavender lit faces.
- **Ink** (`ink.ts`): #030303, 5.1 px near (6 m) → 3.3 px far (90 m) at 1920x1080, creases ×0.8 from 35°, depth
  jumps from 1 %, fog tint 0.3 only far; character cards on layer `NOINK` (they carry their own plum ink).
- **Lens** (`lensblur.ts` + `dofAt` in story.ts): cInf px at 1080: hook/river CU 15-16, close-ups 12-14, MS 10-12,
  park 7, golden sway 5, wides/aerials 0. Focus on the eyes of the front row.
- **Post** (`Bridge.tsx`): ink → lens pre → lens main → bloom (thr 1.0, int .5, 6 levels, radius .6) → NEUTRAL tone
  map → grade; MSAA 4. Film grain exists but is OFF (reference measures no grain; it quadruples the file size).
- **Characters** (`toon.ts`/`cast.ts`/`cardshade.ts`): bean heads h/w .94, plum ink #241726, eyes .26 W apart, no blush,
  14 expressions; adults 3.5 head-heights; walk bob 5 %, lean 1-7°, planted 0.8 m stride; blinks 0.5-2.3 s; tight
  contact shadow ~.5 under the feet + sun-direction tail by day; golden rim inner only (never an offset outer copy).
- **Camera** (`story.ts`): cuts on big jumps, smootherstep glides 18-40 f, every hold creeps (no static hold ≥4 f),
  flip kicks decaying over 7 f on impacts, 4-4.6° rolls, foreground props (`FOREGROUND`) in ~1/3 of shots.

## Look targets (measured from the reference; see references/reports/)
- **Ink:**
  - World lines: about 3 px at 1080 wide, near-black #0b0a0c, nearly constant with distance. Silhouettes, depth jumps and normal creases only. No line on wall/floor joins or the horizon. Character cards are never outlined by the world ink.
  - Character ink: dark plum #201628-#2f1d28, thicker on the bottom/shadow side.
- **Colour:**
  - Day median luma ~.57. Non-ink p5 ~.23 (no crushed blacks). Lit chroma C* p90 ~55. Day sky top ~#5e93d9, horizon 1.28x brighter.
  - Golden: peach horizon #ffd08a, violet-blue shadows (never brown), backlit sun.
- **Depth:**
  - DOF on about 1/3 of screen time (CU, MS, inserts), cInf 10-16 px at 1080, focus on the eyes. Establishing and wide shots stay sharp.
  - Fog = horizon colour, 25→420 m day, 20→360 m golden.
  - Bloom only on HDR emissives: threshold 1.0.
- **Camera:**
  - Hard cuts on big jumps. Everything else is a smootherstep glide of 18-40 f, peak ≤ 25 px/f at 720p.
  - Every hold pushes in 0.15-0.35 %/f, with 0.6 %/f on punch words.
  - Rolls of 4-5°.
  - No hand-held float. Impact shakes flip sign every frame and decay over 7 f.
- **Characters:**
  - About 3.5 head-heights tall, legs 1.4 HH.
  - Stick limbs about 0.055 of head width, ink-dot hands.
  - Bean head (h/w ~0.93, narrower chin, pointier crown).
  - No blush or eye highlights. Faces at brightness ~.93.
  - Walk bob 3-7 %, lean 1-7°, planted feet.
  - Blinks every 0.5-2.3 s, lasting 4 f.

## Look-match loop (how the bridge look was reached; reuse for any "make it look like X" pass)
1. **Measure the reference first.** One analysis agent per topic (motion, depth, textures, characters, lighting, outlines, grade), each writing numbers, not adjectives, to `references/reports/<topic>.md`. Shared brief: `compare/CONTEXT.md`. Reports are the source of truth for every agent after.
2. **Sandboxes, one owner per file.** Copy the project folder to `src/videos/<name>_{cam,world,mat,char,post}` with entries `src/sandboxes/<n>/index.tsx` (same `index.tsx` as main, only the import path changed). Ownership used for the bridge:
   - cam: story.ts (camera keys, cuts, kicks, DOF table, foreground props)
   - world: world.ts, lights.ts, shade.ts, grade.ts (sun, sky, fog, river, colour, grade)
   - mat: paint.ts, build.ts (painted textures, buildings, props)
   - char: toon.ts, cast.ts, cardshade.ts (character drawing, posing, card lighting, fx cards)
   - post: ink.ts, Bridge.tsx, lensblur.ts (outline pass, composer, lens blur, bloom)
   Agents only edit their own files in their own sandbox and render stills with `BRIDGE_ENTRY=src/sandboxes/<n>/index.tsx node scripts/bridge-stills.mjs out/<name>/<n>/x_ <frames> 0.5`.
3. **Merge** with `python scripts/bridge_merge.py [cam,world,mat,char,post]` (backs main up to `backup/bridge_<time>/`, copies owned files only). Then `npx tsc --noEmit` (filter to the project folder), then **re-sync every sandbox from main** (`cp -f src/videos/<name>/* src/videos/<name>_<n>/`) before the next round.
4. **Verify** with a fresh Opus max agent: side-by-side sheets (`python scripts/sbs_sheet.py out.jpg --ours a b --ref r1 r2`), score each area out of 10 (colour day / golden, lighting, ink, textures, characters, depth, composition) plus a numbered fix list with frame numbers. Map each fix to the file owner and resume that owner's agent with SendMessage (keeps its context). Bridge scores: round 1 5/3/4/5/4/7/4/6 → round 2 5/4/5/6/4/7/6/6 → round 3 see notes.
5. Contracts between owners live in exported constants (e.g. `NOINK` layer from ink.ts, `dofAt`/`FOREGROUND` from story.ts, `LIGHTS`/`LOOK` from lights.ts). Changing a contract means telling every owner that reads it.

## Gotchas
- Kenney nature-kit materials are teal: recolour them by material name in build.ts.
- Cameras end up inside houses: the sight-line culler in build.ts/world.ts removes anything blocking any camera ray.
- Ink in the same merged effect pass as DOF gets overwritten. Ink must be its own pass before the blur.
- Pixel-sized post parameters must scale with resolution: stills are at 0.5, the final at 1.333. R3F clamps dpr to ≥ 1, so `--scale 0.5` stills still render a 1920x1080 buffer.
- **Disk:** every Remotion bundle copies `public/` (~1.3 GB) into `the temp folder\remotion-webpack-bundle-*` and never deletes it. 60+ GB filled the system drive during the bridge passes and a render died with ENOSPC. Always render with `export TEMP='<big drive>/remotion-tmp' TMP='<big drive>/remotion-tmp'` (bridge-stills.mjs sets it itself) and ask the user before deleting old bundle folders in the shared the temp folder (auto mode blocks the sweep). <big drive>/remotion-tmp fills too (~500 folders / 110 GB after the 4 bridge rounds): when a project is finished and nothing is rendering, delete its `remotion-webpack-bundle-*` and `puppeteer_dev_chrome_profile-*` folders there.
- In JS strings write `"<big drive>/remotion-tmp"`, never `"<big drive>\remotion-tmp"` (`\r` becomes a carriage return).
- Remotion writes a silent audio track: mux with `-map 0:v:0 -map 1:a:0`.
- Sub-agents can't write report files in this harness: ask them for a ≤150-word final message and save it yourself to `out/<name>/<n>/REPORT.md`.
- Scratch `.ts` files inside `out/` break `tsc`: name them `.txt`.
- 2K renders run ~4 fps (≈10 min for 67 s) with a GPU on the original Windows PC; software WebGL (`swangle`) is slower, so always time one chapter first. (Landscape 2560x1440 has the same pixel count as the old 1440x2560.) Stills at 0.5 take 3-8 s each after a ~40 s bundle.
- Film grain at 2.5 % made the 2K file 910 MB instead of ~250 MB and will turn to mush on YouTube; the reference has none. Keep it off.

- Linux: the original stills script hard-coded a Windows Chrome path; it now auto-detects or uses `CHROME_PATH`. Without a GPU set `REMOTION_GL=swangle`.
- Chapters share one cast: after editing a character or look file in ch01 run `scripts/sync_shared.sh`, or the characters will drift between chapters.
- Wide landscape cameras can show the edge of the built world or the culler-removed gaps: look at the far left/right of every still.

## Readability traps the verifier caught (check every new prop/shot for these)
- **A swing drawn as one rope that disappears behind the kid reads as a HANGING.** Always two ropes to a wide plank
  with the kid between them (`swingKid` in toon.ts), and a frame whose legs clear the arc (A-frame at each end).
- Props or flotsam closer than ~2 m to a lens become huge cut-off blobs at the frame edge. When a camera moves, re-check
  every prop near its new position (the river cameras moved into the floating hats).
- A foreground bush cut by the frame edge reads as a "green ball"; a foreground prop must be recognisable or gone.
- Flags: red + yellow star/diamond reads as Vietnam's. Use a period-correct flag (St George's cross for England 1831).
- Painted signs lit by a side sun go grey-blue and unreadable: give the sign face an unlit material.
- Golden rim light done as an offset outer copy turns every hat into a picture frame: inner rim only, head/torso only.
- Balcony/railing rails at chest height through characters: put the lens ~2.5 m up so rails cross legs, not torsos.
- Flat holds read as freezes in QA (frozen span ≥12 f): every hold needs a creeping push-in.
