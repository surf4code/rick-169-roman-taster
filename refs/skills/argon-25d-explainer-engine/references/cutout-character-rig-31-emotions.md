# 2D Cutout Character Rig & Acted Emotions Library

This reference provides the complete 2.5D paper-cutout character rig (`src/components/CutoutCharacter.tsx` and `src/utils/emotions.ts`), combining the visual style of `What If You Could See Everyone's Body Count - Miko` with the joint rules of `lemo-opuscar` (`TECHNIQUE.md` §10: shoulder abduction before flexion, masked torso overlap so no puppet seam appears) and the acted emotion grammar of `JohnHeibel/ClaudeAnimationBase`.

---

## 1. `src/utils/emotions.ts` (16 Acted Emotion Presets & Interpolation)

Never switch character poses inside an `if` block without blending. Each emotion defines target head tilt, brow angle, eye scale, pupil offset, torso lean, and left/right arm rotations that blend smoothly across 6 frames.

```typescript
export type EmotionName =
  | "neutral"
  | "curious"
  | "talking_animated"
  | "shocked"
  | "skeptical"
  | "happy_relief"
  | "nervous_sweat"
  | "focused_reading"
  | "confident_point"
  | "embarrassed_blush"
  | "sad_slump"
  | "angry_glare"
  | "thinking_chin"
  | "surprised_jump"
  | "shrug_question"
  | "celebrate_arms_up";

export interface EmotionPose {
  headTiltDeg: number;
  torsoLeanDeg: number;
  browLeftDeg: number;
  browRightDeg: number;
  eyeScaleY: number;
  pupilOffsetX: number;
  armLeftDeg: number;   // Shoulder rotation in degrees
  armRightDeg: number;
  forearmRightDeg: number;
  showSweatDrop?: boolean;
  showBlush?: boolean;
  showShockLines?: boolean;
}

export const EMOTION_LIBRARY: Record<EmotionName, EmotionPose> = {
  neutral: {
    headTiltDeg: 0, torsoLeanDeg: 0, browLeftDeg: 0, browRightDeg: 0,
    eyeScaleY: 1, pupilOffsetX: 0, armLeftDeg: 12, armRightDeg: -12, forearmRightDeg: -10,
  },
  curious: {
    headTiltDeg: 8, torsoLeanDeg: 4, browLeftDeg: -10, browRightDeg: 6,
    eyeScaleY: 1.08, pupilOffsetX: 2, armLeftDeg: 15, armRightDeg: -28, forearmRightDeg: -45,
  },
  talking_animated: {
    headTiltDeg: -4, torsoLeanDeg: 3, browLeftDeg: -6, browRightDeg: -6,
    eyeScaleY: 1.0, pupilOffsetX: 0, armLeftDeg: 28, armRightDeg: -52, forearmRightDeg: -35,
  },
  shocked: {
    headTiltDeg: -7, torsoLeanDeg: -8, browLeftDeg: -18, browRightDeg: -18,
    eyeScaleY: 1.32, pupilOffsetX: 0, armLeftDeg: 65, armRightDeg: -65, forearmRightDeg: -25,
    showShockLines: true,
  },
  skeptical: {
    headTiltDeg: -5, torsoLeanDeg: -3, browLeftDeg: 14, browRightDeg: -12,
    eyeScaleY: 0.78, pupilOffsetX: 3, armLeftDeg: 8, armRightDeg: -22, forearmRightDeg: -70,
  },
  happy_relief: {
    headTiltDeg: 5, torsoLeanDeg: 2, browLeftDeg: -8, browRightDeg: -8,
    eyeScaleY: 0.88, pupilOffsetX: 0, armLeftDeg: 20, armRightDeg: -20, forearmRightDeg: -15,
    showBlush: true,
  },
  nervous_sweat: {
    headTiltDeg: 6, torsoLeanDeg: -5, browLeftDeg: -15, browRightDeg: 15,
    eyeScaleY: 1.12, pupilOffsetX: -3, armLeftDeg: 18, armRightDeg: -18, forearmRightDeg: -55,
    showSweatDrop: true,
  },
  focused_reading: {
    headTiltDeg: 10, torsoLeanDeg: 6, browLeftDeg: 8, browRightDeg: 8,
    eyeScaleY: 0.92, pupilOffsetX: 2, armLeftDeg: 22, armRightDeg: -48, forearmRightDeg: -60,
  },
  confident_point: {
    headTiltDeg: -3, torsoLeanDeg: 4, browLeftDeg: -5, browRightDeg: -5,
    eyeScaleY: 1.05, pupilOffsetX: 2, armLeftDeg: 15, armRightDeg: -95, forearmRightDeg: -5,
  },
  embarrassed_blush: {
    headTiltDeg: 12, torsoLeanDeg: -4, browLeftDeg: -14, browRightDeg: 14,
    eyeScaleY: 0.85, pupilOffsetX: -4, armLeftDeg: 10, armRightDeg: -30, forearmRightDeg: -80,
    showBlush: true,
  },
  sad_slump: {
    headTiltDeg: 16, torsoLeanDeg: 10, browLeftDeg: -16, browRightDeg: 16,
    eyeScaleY: 0.72, pupilOffsetX: 0, armLeftDeg: 6, armRightDeg: -6, forearmRightDeg: -5,
  },
  angry_glare: {
    headTiltDeg: -6, torsoLeanDeg: 7, browLeftDeg: 18, browRightDeg: -18,
    eyeScaleY: 0.82, pupilOffsetX: 0, armLeftDeg: 35, armRightDeg: -35, forearmRightDeg: -40,
  },
  thinking_chin: {
    headTiltDeg: 9, torsoLeanDeg: 2, browLeftDeg: 10, browRightDeg: -10,
    eyeScaleY: 0.95, pupilOffsetX: -2, armLeftDeg: 12, armRightDeg: -42, forearmRightDeg: -95,
  },
  surprised_jump: {
    headTiltDeg: -10, torsoLeanDeg: -10, browLeftDeg: -20, browRightDeg: -20,
    eyeScaleY: 1.35, pupilOffsetX: 0, armLeftDeg: 85, armRightDeg: -85, forearmRightDeg: -15,
    showShockLines: true,
  },
  shrug_question: {
    headTiltDeg: 7, torsoLeanDeg: 0, browLeftDeg: -12, browRightDeg: -12,
    eyeScaleY: 1.05, pupilOffsetX: 0, armLeftDeg: 48, armRightDeg: -48, forearmRightDeg: -65,
  },
  celebrate_arms_up: {
    headTiltDeg: -8, torsoLeanDeg: -4, browLeftDeg: -10, browRightDeg: -10,
    eyeScaleY: 1.1, pupilOffsetX: 0, armLeftDeg: 135, armRightDeg: -135, forearmRightDeg: -10,
  },
};
```

---

## 2. `src/components/CutoutCharacter.tsx` (2.5D SVG Billboard Standee inside Three.js)

Renders a crisp, bold-outlined 2D vector character onto a transparent `<Html transform>` or high-DPI `CanvasTexture` plane in 3D space with automatic blinking, RMS mouth viseme switching (`closed`, `mid`, `open`, `o`), stepped 12-fps animation option, and ground contact shadow.

```tsx
import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { EMOTION_LIBRARY, EmotionName } from "../utils/emotions";
import { mulberry32 } from "../utils/cinema";

export interface CutoutCharacterProps {
  id: string;
  position: [number, number, number];
  scale?: number;
  shirtColor?: string;
  hairColor?: string;
  skinColor?: string;
  emotion: EmotionName;
  rmsAmplitude: number;       // 0..1 from timeline.json speech_envelope[frame]
  spectralCentroid?: number;  // 0..1 from timeline.json speech_centroid[frame]
  stepOnTwos?: boolean;       // True = 12fps hand-animated feel over 30fps camera
  flipX?: boolean;
}

export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({
  id,
  position,
  scale = 1,
  shirtColor = "#3B82F6",
  hairColor = "#1E293B",
  skinColor = "#FDE68A",
  emotion,
  rmsAmplitude,
  spectralCentroid = 0.5,
  stepOnTwos = true,
  flipX = false,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate character pose on twos (15fps at 30fps timeline) while camera stays 30fps smooth
  const charFrame = stepOnTwos ? Math.floor(rawFrame / 2) * 2 : rawFrame;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;

  // Deterministic blink every ~3.2s with 4-frame close duration
  const seed = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
    return h >>> 0;
  }, [id]);

  const isBlinking = useMemo(() => {
    const cycle = Math.floor(charFrame / (fps * 3.1));
    const rng = mulberry32(seed + cycle);
    const blinkStart = Math.floor(rng() * (fps * 2.4));
    const localF = charFrame % Math.floor(fps * 3.1);
    return localF >= blinkStart && localF <= blinkStart + 3;
  }, [charFrame, fps, seed]);

  // Subtle idle breathing bob + talking head micro-nod
  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 3.5;
  const talkNod = rmsAmplitude > 0.2 ? Math.sin(charFrame * 0.65) * 4 * rmsAmplitude : 0;

  // 4-Viseme Mouth Selector ('closed' | 'mid' | 'open' | 'o')
  let viseme: "closed" | "mid" | "open" | "o" = "closed";
  if (rmsAmplitude >= 0.14 && rmsAmplitude < 0.42) {
    viseme = "mid";
  } else if (rmsAmplitude >= 0.42) {
    viseme = spectralCentroid < 0.38 ? "o" : "open";
  }

  return (
    <group position={position} scale={[scale * (flipX ? -1 : 1), scale, scale]}>
      {/* Ground Contact Shadow Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#090D16" transparent opacity={0.38} />
      </mesh>

      {/* Crisp 2D Vector Cutout Billboard in 3D World Space */}
      <Html
        transform
        distanceFactor={4.2}
        position={[0, 1.15, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <svg
          width="260"
          height="380"
          viewBox="0 0 260 380"
          style={{ overflow: "visible", filter: "drop-shadow(0px 6px 10px rgba(0,0,0,0.32))" }}
        >
          <g transform={`translate(130, ${220 + breathY}) rotate(${pose.torsoLeanDeg})`}>
            {/* Back Arm (Left) */}
            <g transform={`translate(-44, -68) rotate(${pose.armLeftDeg})`}>
              <rect
                x="-14"
                y="0"
                width="26"
                height="86"
                rx="13"
                fill={shirtColor}
                stroke="#111111"
                strokeWidth="4.5"
              />
              <circle cx="-1" cy="90" r="12" fill={skinColor} stroke="#111111" strokeWidth="4.5" />
            </g>

            {/* Legs */}
            <rect x="-34" y="45" width="26" height="92" rx="12" fill="#1E293B" stroke="#111111" strokeWidth="4.5" />
            <rect x="8" y="45" width="26" height="92" rx="12" fill="#1E293B" stroke="#111111" strokeWidth="4.5" />

            {/* Torso (Drawn OVER back shoulder and under front shoulder mask to prevent puppet seams) */}
            <path
              d="M -46 -76 C -50 -20, -48 35, -42 55 L 42 55 C 48 35, 50 -20, 46 -76 Z"
              fill={shirtColor}
              stroke="#111111"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Front Arm (Right) with masked inner shoulder seam */}
            <g transform={`translate(42, -68) rotate(${pose.armRightDeg + talkNod * 1.5})`}>
              {/* Inner seam cover so shoulder blends into torso */}
              <circle cx="0" cy="6" r="13" fill={shirtColor} />
              <path
                d="M 12 0 L 12 48 A 12 12 0 0 1 -12 48 L -12 14"
                fill={shirtColor}
                stroke="#111111"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Articulated Forearm */}
              <g transform={`translate(0, 46) rotate(${pose.forearmRightDeg})`}>
                <rect x="-11" y="0" width="22" height="46" rx="11" fill={shirtColor} stroke="#111111" strokeWidth="4.5" />
                <circle cx="0" cy="50" r="12" fill={skinColor} stroke="#111111" strokeWidth="4.5" />
              </g>
            </g>

            {/* Head Group */}
            <g transform={`translate(0, -118) rotate(${pose.headTiltDeg + talkNod})`}>
              {/* Head Base */}
              <rect
                x="-46"
                y="-58"
                width="92"
                height="96"
                rx="42"
                fill={skinColor}
                stroke="#111111"
                strokeWidth="4.5"
              />
              {/* Hair Cap */}
              <path
                d="M -48 -24 C -52 -66, 52 -66, 48 -24 C 32 -44, -28 -44, -48 -24 Z"
                fill={hairColor}
                stroke="#111111"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />

              {/* Optional Blush */}
              {pose.showBlush && (
                <>
                  <ellipse cx="-26" cy="4" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
                  <ellipse cx="26" cy="4" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
                </>
              )}

              {/* Eyes */}
              <g transform={`translate(-18, -10) scale(1, ${isBlinking ? 0.12 : pose.eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="7.5" ry="9.5" fill="#FFFFFF" stroke="#111111" strokeWidth="3.5" />
                <circle cx={pose.pupilOffsetX} cy="0" r="4" fill="#111111" />
              </g>
              <g transform={`translate(18, -10) scale(1, ${isBlinking ? 0.12 : pose.eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="7.5" ry="9.5" fill="#FFFFFF" stroke="#111111" strokeWidth="3.5" />
                <circle cx={pose.pupilOffsetX} cy="0" r="4" fill="#111111" />
              </g>

              {/* Eyebrows */}
              <line
                x1="-28"
                y1="-25"
                x2="-8"
                y2="-25"
                stroke="#111111"
                strokeWidth="4.5"
                strokeLinecap="round"
                transform={`rotate(${pose.browLeftDeg}, -18, -25)`}
              />
              <line
                x1="8"
                y1="-25"
                x2="28"
                y2="-25"
                stroke="#111111"
                strokeWidth="4.5"
                strokeLinecap="round"
                transform={`rotate(${pose.browRightDeg}, 18, -25)`}
              />

              {/* 4-Viseme Mouth */}
              {viseme === "closed" && (
                <path d="M -10 15 Q 0 20 10 15" fill="none" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
              )}
              {viseme === "mid" && (
                <rect x="-11" y="11" width="22" height="9" rx="4.5" fill="#991B1B" stroke="#111111" strokeWidth="3.5" />
              )}
              {viseme === "open" && (
                <path
                  d="M -14 9 L 14 9 C 14 26, -14 26, -14 9 Z"
                  fill="#991B1B"
                  stroke="#111111"
                  strokeWidth="3.8"
                />
              )}
              {viseme === "o" && (
                <ellipse cx="0" cy="16" rx="8" ry="10" fill="#991B1B" stroke="#111111" strokeWidth="3.8" />
              )}

              {/* Sweat Drop */}
              {pose.showSweatDrop && (
                <path
                  d="M 38 -28 C 44 -16, 32 -16, 38 -28 Z"
                  fill="#38BDF8"
                  stroke="#111111"
                  strokeWidth="2.5"
                />
              )}
            </g>
          </g>
        </svg>
      </Html>
    </group>
  );
};
```
