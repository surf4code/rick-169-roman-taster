# 12 Shot Recipe Cards, Deterministic Camera Rig, Readcheck Subtitles & Visual QA

This reference synthesizes the shot recipe system from `Vincentwei1021/video-shotcraft` and the review loop from `lemomo-ai/lemo-opuscar` (`DIRECTOR.md` §7-11).

---

## 1. The 12 Signature 2.5D Shot Recipe Cards (`src/utils/cinema.ts`)

Every shot in `src/timeline.json` maps to one of these 12 deterministic camera recipes. `getCameraPose()` automatically adjusts Z-distance when rendering `9:16` Shorts so characters never clip at the vertical frame edges.

```typescript
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export type ShotCardId =
  | "card_01_wide_diorama_push"
  | "card_02_medium_twoshot_orbit"
  | "card_03_closeup_rack_focus"
  | "card_04_ots_foreground_blur"
  | "card_05_floating_counter_pop"
  | "card_06_whip_pan_transition"
  | "card_07_crowd_parallax_truck"
  | "card_08_isometric_data_chart"
  | "card_09_dutch_angle_shock"
  | "card_10_spotlight_isolation"
  | "card_11_scale_pullback_reveal"
  | "card_12_bookend_horizon_hold";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  rollDeg: number;
  focusDistance: number;
  bokehScale: number;
}

export function getCameraPose(
  card: ShotCardId,
  progress: number, // 0..1 across the shot
  isVertical: boolean
): CameraPose {
  const e = smoothstep(0, 1, progress);
  const zMul = isVertical ? 1.36 : 1.0;

  switch (card) {
    case "card_01_wide_diorama_push":
      return {
        position: [0, 1.85, (7.8 - e * 1.5) * zMul],
        target: [0, 1.25, 0],
        rollDeg: 0,
        focusDistance: 0.034,
        bokehScale: 1.8,
      };
    case "card_02_medium_twoshot_orbit": {
      const ang = -0.22 + e * 0.44;
      const rad = 5.2 * zMul;
      return {
        position: [Math.sin(ang) * rad, 1.5, Math.cos(ang) * rad],
        target: [0, 1.3, 0],
        rollDeg: 0,
        focusDistance: 0.024,
        bokehScale: 2.2,
      };
    }
    case "card_03_closeup_rack_focus":
      return {
        position: [-0.85 + e * 0.2, 1.55, (3.2 - e * 0.35) * zMul],
        target: [-0.85, 1.45, 0],
        rollDeg: 0,
        focusDistance: 0.015,
        bokehScale: 3.2,
      };
    case "card_04_ots_foreground_blur":
      return {
        position: [1.35 - e * 0.15, 1.58, (4.0 - e * 0.25) * zMul],
        target: [-0.75, 1.38, -0.3],
        rollDeg: 0,
        focusDistance: 0.022,
        bokehScale: 2.9,
      };
    case "card_05_floating_counter_pop":
      return {
        position: [0, 1.75 + e * 0.35, (4.6 - e * 0.4) * zMul],
        target: [0, 1.85, 0],
        rollDeg: 0,
        focusDistance: 0.021,
        bokehScale: 2.4,
      };
    case "card_06_whip_pan_transition": {
      const whip = Math.pow(smoothstep(0, 0.35, progress), 2);
      return {
        position: [-2.4 + whip * 2.4, 1.5, 4.8 * zMul],
        target: [-1.2 + whip * 1.2, 1.35, 0],
        rollDeg: 0,
        focusDistance: 0.023,
        bokehScale: 2.1,
      };
    }
    case "card_07_crowd_parallax_truck":
      return {
        position: [-1.8 + e * 3.6, 1.6, 5.8 * zMul],
        target: [-0.9 + e * 1.8, 1.3, 0],
        rollDeg: 0,
        focusDistance: 0.027,
        bokehScale: 2.5,
      };
    case "card_08_isometric_data_chart":
      return {
        position: [2.8 - e * 0.6, 3.2 - e * 0.3, (6.2 - e * 0.5) * zMul],
        target: [0, 1.5, 0],
        rollDeg: 0,
        focusDistance: 0.03,
        bokehScale: 1.9,
      };
    case "card_09_dutch_angle_shock":
      return {
        position: [-0.4, 1.48, (3.5 - e * 0.5) * zMul],
        target: [-0.4, 1.45, 0],
        rollDeg: -4.5 + e * 1.5,
        focusDistance: 0.016,
        bokehScale: 3.0,
      };
    case "card_10_spotlight_isolation":
      return {
        position: [0, 2.3 - e * 0.4, (5.0 - e * 0.8) * zMul],
        target: [0, 1.25, 0],
        rollDeg: 0,
        focusDistance: 0.022,
        bokehScale: 2.8,
      };
    case "card_11_scale_pullback_reveal":
      return {
        position: [0, 1.5 + e * 1.2, (3.8 + e * 4.2) * zMul],
        target: [0, 1.3, 0],
        rollDeg: 0,
        focusDistance: 0.032,
        bokehScale: 1.7,
      };
    case "card_12_bookend_horizon_hold":
      return {
        position: [0, 1.75, (6.5 + e * 0.6) * zMul],
        target: [0, 1.4, 0],
        rollDeg: 0,
        focusDistance: 0.03,
        bokehScale: 2.0,
      };
  }
}
```

---

## 2. `src/components/CaptionOverlay.tsx` (Readcheck-Compliant Kinetic Subtitles)

Positions high-contrast rounded subtitle pills in the lower safe region (`bottom: 8%`), enforcing `lemo-opuscar`'s minimum hold time (`max(1.8s, letters / 15 + 1.2s)`) so captions never flash too fast to read or cover character faces.

```tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export interface PhraseCue {
  start: number;
  end: number;
  text: string;
}

export const CaptionOverlay: React.FC<{ phrases: PhraseCue[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  const active = phrases.find((p) => {
    const minHold = Math.max(1.8, p.text.length / 15 + 1.2);
    const effectiveEnd = Math.max(p.end, p.start + minHold);
    return nowSec >= p.start && nowSec <= effectiveEnd;
  });

  if (!active || !active.text) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "7%",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          border: "3px solid #111111",
          boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
          borderRadius: "16px",
          padding: "14px 28px",
          maxWidth: "82%",
          textAlign: "center",
          fontFamily: "'Inter', 'Noto Sans', sans-serif",
          fontWeight: 800,
          fontSize: "34px",
          lineHeight: 1.3,
          color: "#F8FAFC",
          letterSpacing: "0.01em",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
```

---

## 3. `scripts/qa_contact_sheet.py` (Contact Sheet & 0.2s Action Strip Verifier)

Implements `lemo-opuscar`'s visual QA loop (`TECHNIQUE.md` §8): extracts 1 frame every 2 seconds across the rendered video and tiles them into `out/qa_contact_sheet.jpg` using FFmpeg `tile=4x4` so the agent can inspect framing, outlines, and subtitle placement in a single glance.

```python
#!/usr/bin/env python3
import argparse
import subprocess


def build_contact_sheet(video_path: str, out_jpg: str = "out/qa_contact_sheet.jpg"):
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", "fps=1/2,scale=480:-1,tile=4x4",
        "-frames:v", "1",
        "-q:v", "2",
        out_jpg
    ]
    subprocess.check_call(cmd)
    print(f"[qa_contact_sheet] Saved 4x4 visual QA contact sheet -> {out_jpg}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--out", default="out/qa_contact_sheet.jpg")
    args = ap.parse_args()
    build_contact_sheet(args.video, args.out)
```

---

## 4. One-Command Windows / Linux Dual-Render Script (`build_all.bat` / `build_all.sh`)

Optimized for 8GB RAM laptops (`--concurrency=2` + `--gl=angle`):

```bat
@echo off
setlocal enabledelayedexpansion

echo [1/5] Extracting audio timeline and speech lip-sync envelope...
python scripts\analyze_audio.py --voice public\audio\voice.mp3 --out src\timeline.json

echo [2/5] Synthesizing procedural foley and ambience stem...
python scripts\sfx_synth.py

echo [3/5] Rendering 16:9 YouTube Master (1920x1080)...
call npx remotion render src/index.ts MikoExplainer16x9 out/raw_16x9.mp4 --concurrency=2 --gl=angle --crf=20
python scripts\mux_master.py --video out\raw_16x9.mp4 --voice public\audio\voice.mp3 --sfx public\audio\sfx_stem.wav --out out\youtube_16x9.mp4 --verify

echo [4/5] Rendering 9:16 Shorts Master (1080x1920)...
call npx remotion render src/index.ts MikoExplainer9x16 out/raw_9x16.mp4 --concurrency=2 --gl=angle --crf=20
python scripts\mux_master.py --video out\raw_9x16.mp4 --voice public\audio\voice.mp3 --sfx public\audio\sfx_stem.wav --out out\shorts_9x16.mp4 --verify

echo [5/5] Building QA Contact Sheet...
python scripts\qa_contact_sheet.py --video out\youtube_16x9.mp4 --out out\qa_contact_sheet.jpg
echo Done! Outputs saved in out\youtube_16x9.mp4 and out\shorts_9x16.mp4
```
