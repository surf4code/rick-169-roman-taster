---
name: argon-25d-explainer-engine
description: Heavy production-grade 2.5D animated explainer video studio combining Remotion, Three.js (@react-three/fiber), React Postprocessing, React Three Rapier physics, 2D cutout character rigs with acted emotions, librosa beat/lip-sync, and procedural SFX. Use whenever the user asks to create 2.5D animated explainer videos, Miko-style story animations, code-rendered films, YouTube explainers (16:9), or Shorts/Reels (9:16) from a voiceover or script.
---

# Argon 2.5D Explainer Engine

A heavy, end-to-end code-driven animation production engine that synthesizes the architecture of `lemomo-ai/lemo-opuscar` (directing, treatment, procedural foley, contact-sheet QA, paper-popup and diorama rules), `Vincentwei1021/video-shotcraft` (shot recipe cards, beat sync, aesthetic rules, visual hold budgets), `JohnHeibel/ClaudeAnimationBase` (acted character emotions, handmade alive motion, shoulder joint continuity), `patch-gg/pixelfx` (deterministic particle bursts and atmospheric effects), `pmndrs/react-three-rapier` (rigid-body physics props), and `pmndrs/react-postprocessing` (depth-of-field bokeh, selective bloom, vignette).

## When to Use

- Generating a complete 2.5D animated explainer or story video (like Miko, Life Noggin, or Kurzgesagt 2.5D) from a voiceover file (`voice.mp3` / `voice.wav`) or a text script.
- Building Three.js + Remotion scenes with 3D diorama staging, volumetric god rays, depth-of-field blur, and flat bold-outline 2D cutout characters.
- Synchronizing character lip-sync, floating 3D stat counters, camera cuts, and sound effects to exact speech syllables and music beats.
- Exporting dual-format deliverables (`1920x1080` YouTube 16:9 and `1080x1920` Shorts/Reels 9:16) with `-14 LUFS` broadcast loudness normalization on Windows, macOS, or Linux.

## Auxiliary Reference Blueprints

Read and copy the implementation modules from these companion reference files when scaffolding a video project:

- `references/audio-beat-lipsync-pipeline.md`: Contains `analyze_audio.py` (librosa RMS lip-sync envelope, BPM beat grid `beatF(n)`, and faster-whisper word timestamps), `sfx_synth.py` (procedural numpy/scipy foley synthesizer for whooshes, pops, dings, footsteps, and room tone), and `mux_master.py` (FFmpeg two-pass `-14 LUFS` loudnorm mastering).
- `references/cutout-character-rig-31-emotions.md`: Contains `CutoutCharacter.tsx` and `emotions.ts` with 2.5D paper-standee SVG rigging, bold `#111111` outlines, abduction-then-flexion shoulder joint continuity (no puppet seams), 12-fps stepped character pose option ("animate on twos" over a smooth 30-fps camera), 4 mouth visemes, and 16 acted emotion states.
- `references/diorama-3d-postfx-rapier.md`: Contains `DioramaStage.tsx` (parameterized 3D rooms, buses, lecture halls, streets, and offices), `PostFX.tsx` (DepthOfField, selective Bloom, Vignette), `AtmosphereFX.tsx` (volumetric light shafts and `pixelfx`-inspired deterministic dust/spark emitters), `FloatingCounter3D.tsx` (glowing numbers above characters' heads), and `PhysicsDropProps.tsx` (`@react-three/rapier` rigid-body prop drops).
- `references/shotcraft-camera-cards-and-qa.md`: Contains 12 Shot Recipe Cards, `cinema.ts` (`mulberry32` seeded PRNG, `worldToScreen` projection, smooth camera interpolation), `CaptionOverlay.tsx` (readcheck-verified subtitle holds), `qa_contact_sheet.py` (contact sheet & 0.2s action strip verifier), and 8GB-RAM-safe build scripts.

## Core Aesthetic & Directing Rules

1. **Sound, Rhythm, Camera, Performance (In That Order):**
   - A code-rendered film succeeds by rhythm, staging, and sound design before raw polygon count. Every visible action (character pop-in, floating number increment, camera whip, prop drop) triggers a synchronized sound event.
   - Include at least two brief moments of near-silence (ambience only) right before the major narrative turn or climax so the first impact sound lands with maximum weight.

2. **2.5D Diorama Staging with Real Z-Parallax:**
   - Place foreground silhouette props (`z = +1.8` to `+2.5`), mid-ground cutout characters (`z = -0.5` to `+0.8`), and background architectural walls/windows (`z = -3.0` to `-5.0`) on separate depth planes.
   - Light every environment with three distinct sources: a soft directional key light (`castShadow`, `1024x1024` shadow map), a contrasting warm/cool rim light to carve character silhouettes out from the background, and a low-intensity hemisphere fill light.

3. **2D Vector Paper-Cutout Characters Inside 3D Space:**
   - Render characters as flat 2.5D billboard planes (`#111111` outer stroke, `3.5px` width) with ground contact shadows and subtle cardboard thickness or rim glow.
   - **No Puppet Seams:** Order shoulder rotations as abduction first, then flexion, and mask the inner shoulder outline where the upper arm overlaps the torso.
   - **Anticipation & Follow-Through:** Never switch character poses inside a raw `if` statement. Blend every pose transition with damped spring or cubic-bezier easing, and add a 3-to-5 frame anticipation dip before jumps, points, or shock reactions.
   - **Animate on Twos (Optional Stylistic Toggle):** Step character limb and facial animation at 12 fps (`Math.floor(frame / 2) * 2`) for a tactile hand-crafted cartoon feel while keeping the 3D camera, lighting, and particles completely smooth at 30 fps.

4. **Cinematic Post-Processing (`@react-three/postprocessing`):**
   - **Dynamic Rack-Focus (`DepthOfField`):** Continuously bind `focusDistance` to the active speaking character's Z-coordinate so foreground obstructions and background crowds blur into soft bokeh (`bokehScale = 2.0` to `3.2`, `height = 360`).
   - **Selective Glow (`Bloom`):** Keep `luminanceThreshold = 0.85` and `mipmapBlur = true`. Assign `toneMapped={false}` and `emissiveIntensity={2.2}` only to floating stat counters above heads, screen glow, and volumetric window beams so character shirts and walls never wash out.

5. **Pacing, Hold Budgets, and Readability (`readcheck`):**
   - **One Motion Grammar Per Shot:** Never stack multiple competing camera stunts in the same shot. Cap full-screen camera impact shakes (`slam`) at a maximum of 3 across the entire video.
   - **Breathing Room:** Hold key stat reveals and title cards for at least `1.8s` after their entrance animation settles. Compute subtitle hold duration as `max(1.8, letters / 15 + 1.2)` seconds and position captions in the lower safe zone so they never cover character faces or floating counters.

6. **Strict Determinism:**
   - Never call `Math.random()` or `Date.now()`. Drive all particle positions, eye blinks, camera shake, and crowd variations from `mulberry32(seed)` indexed by `frame` and `entityId`.

## Eight-Stage Autonomous Production Workflow

When the user provides a voiceover (`voice.mp3` / `voice.wav`) or a script/topic, execute all eight stages end-to-end without pausing for intermediate confirmations unless critical files are missing:

1. **Stage 1 - Audio, Lip-Sync & Beat Grid Extraction:**
   - If the user provides only a text script, generate `public/audio/voice.mp3` using `edge-tts` or `kokoro-onnx`.
   - Write and run `scripts/analyze_audio.py` from `references/audio-beat-lipsync-pipeline.md` to produce `src/timeline.json` containing total frames, 30-fps RMS amplitude array (`speech_envelope`), word/phrase timings, BGM beat frames (`beatF(n)`), and shot boundaries.

2. **Stage 2 - Director's Treatment & Shot Mapping (`TREATMENT.md`):**
   - Before writing scene code, create `TREATMENT.md` defining:
     - Logline and 3-act emotional arc (Hook in first 3 seconds -> Escalation -> Climax/Echo Ending).
     - Shot-by-shot table mapping every 4 to 7 seconds of `timeline.json` to one of the 12 Shot Recipe Cards in `references/shotcraft-camera-cards-and-qa.md`, specifying environment preset, active characters, emotion transitions, floating counter values, camera move, and SFX cues.

3. **Stage 3 - Remotion + Three.js + Rapier Project Scaffolding:**
   - Initialize the project and install dependencies:
     `remotion`, `@remotion/cli`, `@remotion/three`, `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `@react-three/rapier`.
   - Copy the core utilities and components from the reference files into `src/utils/` and `src/components/`.

4. **Stage 4 - Character Cast & Environment Assembly:**
   - Configure distinct character palettes, hair/accessory silhouettes, and initial floating head badges (`FloatingCounter3D.tsx`) so every character is recognizable at thumbnail size.
   - Build the required 3D diorama sets (`apartment_courtyard`, `kitchen_morning`, `city_bus_interior`, `lecture_hall`, `street_crosswalk`, `minimal_data_void`) using `DioramaStage.tsx`.

5. **Stage 5 - Procedural Foley & Audio Mix Generation:**
   - Run `scripts/sfx_synth.py` from `references/audio-beat-lipsync-pipeline.md` to synthesize frame-accurate foley WAVs (`whoosh`, `pop_badge`, `counter_tick`, `shock_riser`, `thump_impact`, and room ambience) directly from the shot cues in `src/timeline.json`.
   - Mix voiceover, ducked BGM (`-12 dB` under speech), and foley stems, then normalize to `-14 LUFS` via `scripts/mux_master.py`.

6. **Stage 6 - Visual QA Gate (Contact Sheet & Strip Check):**
   - Render still frames every 2 seconds (`npx remotion still`) and 0.2-second action strips across key character reactions using `scripts/qa_contact_sheet.py` from `references/shotcraft-camera-cards-and-qa.md`.
   - Inspect for: black/NaN frames, camera clipping through walls, unreadable dark-on-dark text, subtitles overlapping character faces, or blown-out bloom. Fix any defects in a single pass.

7. **Stage 7 - Dual-Aspect Final Render (`16:9` & `9:16`):**
   - Render both horizontal and vertical master videos from the same `src/timeline.json` using `--concurrency=2` (tuned for 8GB RAM stability):
     - `out/youtube_16x9.mp4` (`1920x1080`, 30 fps, H.264 `crf 20`)
     - `out/shorts_9x16.mp4` (`1080x1920`, 30 fps, H.264 `crf 20`)
   - Export `out/subtitles.srt` and `out/poster.jpg`.

8. **Stage 8 - Final Verification & Delivery:**
   - Run `ffprobe` / `ffmpeg -af ebur128` and `blackdetect` via `scripts/mux_master.py --verify` to confirm zero black frames, exact audio duration match, and `-14 LUFS` loudness before reporting completion.

## Gotchas & Hardware Guardrails

- **8GB RAM / Integrated GPU Protection:** Never exceed `--concurrency=2` when rendering Remotion + Three.js on laptops with 8GB RAM. Always set `<EffectComposer multisampling={0}>`, `DepthOfField height={360}`, and shadow map size `1024` to prevent headless Chromium WebGL context loss.
- **Perspective Camera Requirement:** `@react-three/postprocessing` `DepthOfField` requires a `PerspectiveCamera` (`fov={38}`). Do not use an orthographic camera with the standard depth pass or the screen will blur uniformly.
- **No Unbounded Loops in `useCurrentFrame()`:** Compute all physics or particle states deterministically as pure functions of `frame` (or pre-baked trajectories) so out-of-order multi-worker rendering produces zero frame tearing.
