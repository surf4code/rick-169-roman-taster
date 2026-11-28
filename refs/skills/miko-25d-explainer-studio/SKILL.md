---
name: miko-25d-explainer-studio
description: Autonomous 2.5D animated explainer video production skill using Remotion, Three.js (@react-three/fiber), React Postprocessing, 2D vector cutout rigs, librosa/Whisper beat-and-speech sync, and Freesound SFX. Use when generating animated story videos, YouTube explainers (16:9), or Shorts/Reels (9:16) from a voiceover audio file and script in the 2.5D diorama + flat bold-outline vector character aesthetic.
---

# Miko 2.5D Explainer Studio

An end-to-end, deterministic code-driven animation skill that synthesizes the best architectural patterns from `video-shotcraft`, `lemo-opuscar`, `three.js` / `react-three-fiber`, `react-postprocessing`, and `librosa` into a self-contained Remotion video pipeline.

## Core Aesthetic & Visual Invariants

1. **2.5D Diorama Environments (`Three.js` + `@react-three/fiber`):**
   - Build low-poly, warmly lit 3D room, street, classroom, transit, or architectural stages with real Z-depth separation between foreground props, mid-ground characters, and background walls.
   - Lighting setup: One soft directional key light with crisp shadows, one cool/warm rim directional light to separate silhouettes, and subtle hemisphere fill light. Never use flat unlit ambient lighting alone.

2. **Flat 2D Vector Paper-Cutout Characters (`CutoutRig`):**
   - Render characters as crisp 2D SVG/Canvas billboard planes standing inside the 3D scene with subtle ground contact shadows.
   - Enforce bold dark outlines (`#111111`, 3px-4px stroke weight), clean flat color fills, and articulated joint pivots: head tilt, blinking eyes, lip-sync mouth states (`closed`, `mid`, `open`, `o`), and shoulder/elbow rotation with anticipation and follow-through easing.
   - Order shoulder rotations cleanly and keep overlapping torso/arm outlines clean so joints do not look like detached paper clips.

3. **Cinematic Post-Processing (`@react-three/postprocessing`):**
   - **Depth of Field (`DepthOfField`):** Rack-focus dynamically to the active speaker's Z-plane (`bokehScale={2.2}`), softly blurring background crowds and foreground objects.
   - **Selective Bloom (`Bloom`):** Use `luminanceThreshold={0.85}` and `mipmapBlur` so floating glowing counters, neon badges, window sunbeams, and UI highlights emit a clean soft halo without washing out character colors.
   - **Atmosphere & Vignette:** Populate 3D air space with slow-drifting deterministic dust motes (`InstancedMesh` or point sprites) and finish with a subtle `Vignette` (`darkness={0.45}`).

4. **Kinetic Typography & Floating Data Overlays:**
   - Render bold, high-contrast floating counters, icons, and callout badges directly in 3D world space above characters' heads or as crisp screen-space overlays.
   - Hold every on-screen title or stat badge long enough to read: minimum `1.8s` or `(characters / 15 + 1.2)s`.

## Six-Stage Autonomous Execution Pipeline

Do not pause to ask the user creative questions once a voiceover audio file or topic script is provided. Execute all six stages continuously:

### Stage 0: Audio & Speech Timing Extraction
- Inspect the workspace for `voice.mp3` / `voice.wav` (and optional `bgm.mp3`). If no voiceover exists yet and a script is given, synthesize voiceover using local TTS (`edge-tts` or `kokoro-onnx`) and normalize to `-14 LUFS`.
- Run `scripts/analyze_audio.py` on the voiceover (and BGM if present) to extract exact sentence/word timestamps, speech energy envelopes (for automatic mouth lip-sync driving), and BPM beat grids.
- Save the unified timing source of truth to `src/timeline.json`.

### Stage 1: Treatment & Camera Shot List (`TREATMENT.md`)
- Map every 4 to 8 seconds of `timeline.json` to a distinct camera shot. Never repeat the same camera move back-to-back.
- Rotate through 5 core camera grammars:
  1. **Wide Establishing Dolly:** Slow Z-axis push into a full 3D room/courtyard with parallax foreground framing.
  2. **Medium Two-Shot Orbit:** Subtle 8-15 degree horizontal arc around two interacting cutout characters.
  3. **Close-Up Rack Focus:** Tight framing on a character's reaction while background characters blur out via `DepthOfField`.
  4. **Over-the-Shoulder (OTS) Depth Shot:** Foreground character blurred on one edge, speaker sharp in mid-ground.
  5. **Isometric / Elevated Data Reveal:** Camera tilts up or pulls back as glowing 3D counters, charts, or floating icons pop into place.
- Reserve camera impact shakes (`shake` helper) for at most 3 major narrative turns per video; keep all other transitions smooth (`cubic-bezier` / damped spring).

### Stage 2: Project Scaffolding & Reusable Components
- Initialize a Remotion + React Three Fiber project in the working directory if `package.json` does not exist, installing:
  `remotion`, `@remotion/cli`, `@remotion/three`, `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`.
- Build modular components under `src/components/`:
  - `DioramaEnvironment.tsx` (parameterized 3D room/exterior builder with volumetric window light shafts and dust motes)
  - `CutoutCharacter.tsx` (2D vector SVG-to-texture rigged character driven by `timeline.json` speech envelope and emotion states)
  - `FloatingCounter.tsx` (emissive glowing number/icon badges that trigger Bloom)
  - `CameraRig.tsx` (deterministic smooth camera interpolation + rack-focus target tracking)
  - `PostFX.tsx` (EffectComposer with DepthOfField, Bloom, and Vignette)
  - `CaptionOverlay.tsx` (clean word-by-word or phrase-synced subtitles positioned away from character faces)

### Stage 3: Deterministic Rendering Rules
- **Zero Non-Determinism:** Never call `Math.random()` or `Date.now()` anywhere in React/Three.js render paths. Use the seeded `mulberry32(seed)` PRNG in `src/utils/random.ts` for dust motes, crowd placement, and idle breathing offsets so multi-worker headless Chrome rendering produces identical frames.
- **Hardware & RAM Optimization:** Configure `<ThreeCanvas gl={{ powerPreference: "high-performance", antialias: true }}>`, cap shadow map resolution at `1024x1024`, set `DepthOfField` `height={360}`, and render with `--concurrency=2` on 8GB RAM systems so Chromium workers never OOM.

### Stage 4: Sound Design & Audio Mixing
- Add subtle procedural or Freesound foley events (`whoosh` on fast camera pans, `pop` on floating counter appearances, `ding` on stat reveals, soft room tone ambience) aligned to exact frame numbers in `src/timeline.json`.
- Duck background music by `-10 dB` to `-14 dB` whenever voiceover speech energy is active.
- Master final audio mix via FFmpeg two-pass `loudnorm` to `-14 LUFS` with true peak `-1.0 dBTP`.

### Stage 5: Visual QA Gate (Still Frame Inspection)
- Before rendering the full video, render 4 key test frames (`npx remotion still`) covering: opening wide shot, character close-up with depth blur, glowing counter overlay, and ending frame.
- Verify no black frames, no clipped text, proper character outline contrast, and readable Depth of Field focus. Fix any framing issues immediately.

### Stage 6: Dual-Aspect Final Delivery (`16:9` & `9:16`)
- Render both formats from the same `timeline.json` using responsive camera FOV/framing adjustments:
  - `out/youtube_16x9.mp4` (`1920x1080`, 30fps, H.264 `crf 20`)
  - `out/shorts_9x16.mp4` (`1080x1920`, 30fps, H.264 `crf 20`)
- Export `out/subtitles.srt` alongside the video files.

## Gotchas & Pitfalls

- **WebGL Context Loss in Headless Render:** Too many concurrent Remotion browser tabs exhaust GPU/CPU memory on laptops. Always pass `--concurrency=2` and `--gl=angle` (or default SwiftShader/ANGLE on Windows) if WebGL contexts drop.
- **Bloom Washing Out the Scene:** If `Bloom` `luminanceThreshold` is set below `0.8`, white character shirts or walls will glow uncontrollably. Keep threshold at `0.85+` and give glowing counters/lights `emissiveIntensity={2.0}` with `toneMapped={false}`.
- **Orthographic vs Perspective DepthOfField:** `@react-three/postprocessing` `DepthOfField` requires a `PerspectiveCamera` (`fov={35}` to `45`). Using an orthographic camera breaks depth buffer blur.
- **Puppet-Seam Arms:** Do not draw a dark outline across the inner shoulder circle where the upper arm overlaps the torso; draw the torso fill over the inner shoulder pivot or split the stroke path so the joint blends cleanly.
