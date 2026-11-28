import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import charactersData from "../data/characters.json";
import { EMOTION_LIBRARY, EmotionName } from "../utils/emotions";
import { mulberry32 } from "../utils/anim";

export type CharacterId = keyof typeof charactersData.cast;

export interface CutoutCharacterProps {
  characterId: CharacterId;
  position: [number, number, number];
  scale?: number;
  emotion: EmotionName;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  stepOnTwos?: boolean;
  flipX?: boolean;
}

export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({
  characterId,
  position,
  scale = 1,
  emotion,
  rmsAmplitude = 0,
  spectralCentroid = 0.5,
  stepOnTwos = true,
  flipX = false,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const defs = charactersData.defaults;

  const charFrame = stepOnTwos ? Math.floor(rawFrame / 2) * 2 : rawFrame;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;

  const seed = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < characterId.length; i++) h = Math.imul(h ^ characterId.charCodeAt(i), 16777619);
    return h >>> 0;
  }, [characterId]);

  const isBlinking = useMemo(() => {
    const cycle = Math.floor(charFrame / (fps * 3.1));
    const rng = mulberry32(seed + cycle);
    const blinkStart = Math.floor(rng() * (fps * 2.4));
    const localF = charFrame % Math.floor(fps * 3.1);
    return localF >= blinkStart && localF <= blinkStart + 3;
  }, [charFrame, fps, seed]);

  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 3.0;
  const talkNod = rmsAmplitude > 0.18 ? Math.sin(charFrame * 0.65) * 3.8 * rmsAmplitude : 0;

  let viseme: "closed" | "mid" | "open" | "o" = "closed";
  if (rmsAmplitude >= 0.14 && rmsAmplitude < 0.42) viseme = "mid";
  else if (rmsAmplitude >= 0.42) viseme = spectralCentroid < 0.38 ? "o" : "open";

  const finalScale = scale * (spec.heightScale ?? 1.0);
  const ink = defs.outlineColor;
  const skin = defs.skinColor;
  const shirt = spec.bodyColor;
  const accent = spec.accentColor;

  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.52, 24]} />
        <meshBasicMaterial color="#303854" transparent opacity={0.28} />
      </mesh>
      <Html transform distanceFactor={4.2} position={[0, 1.15, 0]} style={{ pointerEvents: "none", userSelect: "none" }}>
        <svg width="260" height="380" viewBox="0 0 260 380" style={{ overflow: "visible" }}>
          <g transform={`translate(130, ${220 + breathY}) rotate(${pose.torsoLeanDeg})`}>
            {/* Stick Legs */}
            <line x1="-18" y1="48" x2="-22" y2="132" stroke={ink} strokeWidth="7" strokeLinecap="round" />
            <line x1="18" y1="48" x2="22" y2="132" stroke={ink} strokeWidth="7" strokeLinecap="round" />
            {/* Back Stick Arm */}
            <g transform={`translate(-38, -52) rotate(${pose.armLeftDeg})`}>
              <line x1="0" y1="0" x2="-6" y2="76" stroke={ink} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="-6" cy="80" r="8" fill={skin} stroke={ink} strokeWidth="3.5" />
            </g>
            {/* Vibrant Role-Coded Tunic / Toga Torso */}
            <path d="M -38 -64 C -44 -14, -42 36, -34 54 L 34 54 C 42 36, 44 -14, 38 -64 Z" fill={shirt} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
            {/* Role Accent Sash / Stripe */}
            <path d="M -26 -62 L 24 52 L 36 46 L -12 -62 Z" fill={accent} stroke={ink} strokeWidth="3" />
            {/* Front Stick Arm */}
            <g transform={`translate(38, -52) rotate(${pose.armRightDeg + talkNod * 1.4})`}>
              <line x1="0" y1="0" x2="4" y2="44" stroke={ink} strokeWidth="6.5" strokeLinecap="round" />
              <g transform={`translate(4, 44) rotate(${pose.forearmRightDeg})`}>
                <line x1="0" y1="0" x2="2" y2="38" stroke={ink} strokeWidth="6.5" strokeLinecap="round" />
                <circle cx="2" cy="42" r="8" fill={skin} stroke={ink} strokeWidth="3.5" />
              </g>
            </g>
            {/* Bean-Egg Head */}
            <g transform={`translate(0, -114) rotate(${pose.headTiltDeg + talkNod})`}>
              <ellipse cx="0" cy="-6" rx="44" ry="50" fill={skin} stroke={ink} strokeWidth="4" />
              {spec.hairStyle === "laurel_wreath" && (
                <path d="M -38 -36 Q 0 -58 38 -36" fill="none" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
              )}
              {spec.hairStyle === "helmet_crest" && (
                <path d="M -42 -28 Q 0 -74 42 -28 Z" fill="#B91C1C" stroke={ink} strokeWidth="3.5" />
              )}
              {pose.showBlush && (
                <>
                  <ellipse cx="-24" cy="4" rx="8" ry="4.5" fill="#FB7185" opacity="0.55" />
                  <ellipse cx="24" cy="4" rx="8" ry="4.5" fill="#FB7185" opacity="0.55" />
                </>
              )}
              <g transform={`translate(-16, -8) scale(1, ${isBlinking ? 0.12 : pose.eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="6.5" ry="8.5" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
                <circle cx={pose.pupilOffsetX} cy="0" r="3.6" fill={ink} />
              </g>
              <g transform={`translate(16, -8) scale(1, ${isBlinking ? 0.12 : pose.eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="6.5" ry="8.5" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
                <circle cx={pose.pupilOffsetX} cy="0" r="3.6" fill={ink} />
              </g>
              <line x1="-26" y1="-24" x2="-7" y2="-24" stroke={ink} strokeWidth="4" strokeLinecap="round" transform={`rotate(${pose.browLeftDeg}, -16, -24)`} />
              <line x1="7" y1="-24" x2="26" y2="-24" stroke={ink} strokeWidth="4" strokeLinecap="round" transform={`rotate(${pose.browRightDeg}, 16, -24)`} />
              {viseme === "closed" && <path d="M -10 14 Q 0 19 10 14" fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />}
              {viseme === "mid" && <rect x="-10" y="10" width="20" height="8" rx="4" fill="#991B1B" stroke={ink} strokeWidth="3" />}
              {viseme === "open" && <path d="M -13 8 L 13 8 C 13 24, -13 24, -13 8 Z" fill="#991B1B" stroke={ink} strokeWidth="3.2" />}
              {viseme === "o" && <ellipse cx="0" cy="15" rx="7.5" ry="9" fill="#991B1B" stroke={ink} strokeWidth="3.2" />}
              {pose.showSweatDrop && <path d="M 38 -24 C 44 -12, 32 -12, 38 -24 Z" fill="#38BDF8" stroke={ink} strokeWidth="2.5" />}
            </g>
          </g>
        </svg>
      </Html>
    </group>
  );
};
