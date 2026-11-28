import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import charactersData from "../data/characters.json";
import { EMOTION_LIBRARY, EmotionName } from "../utils/emotions";
import { mulberry32 } from "../utils/anim";

export type CharacterId = keyof typeof charactersData.cast;

export interface CutoutCharacterSvgProps {
  characterId: CharacterId;
  emotion: EmotionName;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  isBlinking?: boolean;
  breathY?: number;
  talkNod?: number;
  width?: number;
  height?: number;
  uidSuffix?: string;
}

/**
 * Shared Ricks-Clips-style 2D SVG character rig driven strictly by src/data/characters.json.
 * Used identically by both 3D <CutoutCharacter /> billboards and <CharacterConsistencySheet />.
 */
export const CutoutCharacterSvg: React.FC<CutoutCharacterSvgProps> = ({
  characterId,
  emotion,
  rmsAmplitude = 0,
  spectralCentroid = 0.5,
  isBlinking = false,
  breathY = 0,
  talkNod = 0,
  width = 280,
  height = 400,
  uidSuffix = "main",
}) => {
  const spec =
    (charactersData.cast as Record<string, any>)[characterId] ||
    charactersData.cast.taster_protagonist;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;

  const isShock = emotion === "shocked" || emotion === "surprised_jump";
  const isHappy = emotion === "happy_relief" || emotion === "celebrate_arms_up";
  const isAngry = emotion === "angry_glare";
  const isSkeptical = emotion === "skeptical";

  let viseme: "closed" | "mid" | "open" | "o" = "closed";
  if (isShock) viseme = "open";
  else if (isHappy) viseme = "open";
  else if (rmsAmplitude >= 0.14 && rmsAmplitude < 0.42) viseme = "mid";
  else if (rmsAmplitude >= 0.42) viseme = spectralCentroid < 0.38 ? "o" : "open";

  const ink = "#161618";
  const skin = "#FDFAF4";
  const shirt = spec.bodyColor || "#E5984A";
  const accent = spec.accentColor || "#9A3412";
  const clipTorsoId = `torso-clip-${characterId}-${uidSuffix}`;
  const clipHeadId = `head-clip-${characterId}-${uidSuffix}`;

  return (
    <svg width={width} height={height} viewBox="0 0 280 400" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={clipTorsoId}>
          <rect x="-44" y="-58" width="88" height="118" rx="44" ry="44" />
        </clipPath>
        <clipPath id={clipHeadId}>
          <ellipse cx="0" cy="-6" rx="52" ry="45" />
        </clipPath>
      </defs>
      <g transform={`translate(140, ${228 + breathY}) rotate(${pose.torsoLeanDeg})`}>
        {/* Curved Bezier Noodle Stick Legs */}
        <path
          d="M -18 50 Q -26 94 -22 136 L -38 136"
          fill="none"
          stroke={ink}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 18 50 Q 26 94 22 136 L 38 136"
          fill="none"
          stroke={ink}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Back Curved Noodle Arm */}
        <g transform={`translate(-40, -24) rotate(${pose.armLeftDeg})`}>
          <path d="M 0 0 Q -22 34 -12 72" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* Plump Rounded Pill / Capsule Torso (Clipped Outfit + Cel Shade) */}
        <g clipPath={`url(#${clipTorsoId})`}>
          <rect x="-44" y="-58" width="88" height="118" rx="44" fill={shirt} />
          <ellipse cx="-38" cy="4" rx="34" ry="70" fill="#000000" opacity="0.16" />
          <ellipse cx="38" cy="-4" rx="18" ry="52" fill="#FFF3D4" opacity="0.24" />
          <path d="M -28 -58 L 28 60 L 42 54 L -12 -58 Z" fill={accent} stroke={ink} strokeWidth="2.8" />
          <rect x="-44" y="14" width="88" height="13" fill="#683C1C" stroke={ink} strokeWidth="2.8" />
          <rect x="-11" y="12" width="22" height="17" rx="3" fill="#ECBC3E" stroke={ink} strokeWidth="2.8" />
        </g>
        <rect x="-44" y="-58" width="88" height="118" rx="44" ry="44" fill="none" stroke={ink} strokeWidth="5.2" />

        {/* Front Curved Noodle Arm */}
        <g transform={`translate(40, -24) rotate(${pose.armRightDeg + talkNod * 1.4})`}>
          <path d="M 0 0 Q 22 34 12 72" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* Wide Marshmallow Head (Zero Neck — Tucked Directly Over Collar) */}
        <g transform={`translate(0, -84) rotate(${pose.headTiltDeg + talkNod})`}>
          <g clipPath={`url(#${clipHeadId})`}>
            <ellipse cx="0" cy="-6" rx="52" ry="45" fill={skin} />
            <ellipse cx="-40" cy="6" rx="34" ry="54" fill="#D6D2D6" />
            <ellipse cx="32" cy="-24" rx="22" ry="26" fill="#FFFFFF" opacity="0.45" />
          </g>
          <ellipse cx="0" cy="-6" rx="52" ry="45" fill="none" stroke={ink} strokeWidth="5.2" />

          {spec.hairStyle === "messy_tuft" && (
            <path
              d="M -46 -22 L -38 -46 L -18 -56 L 4 -58 L 26 -52 L 46 -24 L 26 -34 L 0 -37 L -26 -34 Z"
              fill={spec.hairColor || "#764822"}
              stroke={ink}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
          )}
          {spec.hairStyle === "laurel_wreath" && (
            <path d="M -42 -32 Q 0 -54 42 -32" fill="none" stroke="#F0B826" strokeWidth="9" strokeLinecap="round" />
          )}
          {spec.hairStyle === "tied_bun" && (
            <>
              <circle cx="0" cy="-54" r="16" fill={spec.hairColor || "#623824"} stroke={ink} strokeWidth="4.2" />
              <path d="M -46 -20 Q 0 -54 46 -20 Q 0 -36 -46 -20 Z" fill={spec.hairColor || "#623824"} stroke={ink} strokeWidth="4" />
            </>
          )}
          {spec.hairStyle === "helmet_crest" && (
            <>
              <path d="M -14 -50 Q 0 -76 14 -50 Z" fill="#D41C24" stroke={ink} strokeWidth="4" />
              <path d="M -52 -18 A 52 44 0 0 1 52 -18 Z" fill="#D6A64E" stroke={ink} strokeWidth="4.8" />
            </>
          )}
          {spec.hairStyle === "bald_ring" && (
            <>
              <path d="M -52 -24 Q -36 -28 -36 -6" fill="none" stroke="#30343C" strokeWidth="7" strokeLinecap="round" />
              <path d="M 52 -24 Q 36 -28 36 -6" fill="none" stroke="#30343C" strokeWidth="7" strokeLinecap="round" />
            </>
          )}

          {/* Eyes: Solid dark oval dots by default; big white ovals ONLY on shock */}
          {isShock ? (
            <>
              <ellipse cx="-16" cy="-7" rx="11" ry="13" fill="#FFFFFF" stroke={ink} strokeWidth="3.5" />
              <circle cx="-16" cy="-7" r="3" fill={ink} />
              <ellipse cx="16" cy="-7" rx="11" ry="13" fill="#FFFFFF" stroke={ink} strokeWidth="3.5" />
              <circle cx="16" cy="-7" r="3" fill={ink} />
            </>
          ) : isHappy ? (
            <>
              <path d="M -24 -6 Q -16 -16 -8 -6" fill="none" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
              <path d="M 8 -6 Q 16 -16 24 -6" fill="none" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="-16" cy="-7" rx="5.5" ry={isBlinking ? 1.0 : 7.8 * pose.eyeScaleY} fill={ink} />
              <ellipse cx="16" cy="-7" rx="5.5" ry={isBlinking ? 1.0 : 7.8 * pose.eyeScaleY} fill={ink} />
              {isSkeptical && (
                <>
                  <line x1="-25" y1="-11" x2="-7" y2="-11" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />
                  <line x1="7" y1="-11" x2="25" y2="-11" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />
                </>
              )}
            </>
          )}

          {/* Thick Floating Rounded Eyebrows */}
          <line
            x1="-26"
            y1="-23"
            x2="-7"
            y2="-23"
            stroke={ink}
            strokeWidth="5.2"
            strokeLinecap="round"
            transform={`rotate(${pose.browLeftDeg}, -16, -23)`}
          />
          <line
            x1="7"
            y1="-23"
            x2="26"
            y2="-23"
            stroke={ink}
            strokeWidth="5.2"
            strokeLinecap="round"
            transform={`rotate(${pose.browRightDeg}, 16, -23)`}
          />

          {/* Mouths */}
          {isAngry ? (
            <g>
              <rect x="-15" y="10" width="30" height="12" rx="5" fill="#FFFFFF" stroke={ink} strokeWidth="3.4" />
              <line x1="-14" y1="16" x2="14" y2="16" stroke={ink} strokeWidth="2.2" />
            </g>
          ) : viseme === "closed" ? (
            <path d="M -10 14 Q 0 20 10 14" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          ) : viseme === "mid" ? (
            <rect x="-12" y="10" width="24" height="10" rx="5" fill="#3A1218" stroke={ink} strokeWidth="3.2" />
          ) : viseme === "open" ? (
            <g>
              <path d="M -16 8 L 16 8 C 16 26, -16 26, -16 8 Z" fill="#3A1218" stroke={ink} strokeWidth="3.4" />
              <rect x="-12" y="9" width="24" height="5" rx="2" fill="#FFFFFF" />
              <ellipse cx="0" cy="21" rx="8" ry="4" fill="#EC5C72" />
            </g>
          ) : (
            <ellipse cx="0" cy="16" rx="8" ry="10" fill="#3A1218" stroke={ink} strokeWidth="3.4" />
          )}

          {/* Glossy Cyan Sweat Drop */}
          {pose.showSweatDrop && (
            <g transform="translate(38, -26)">
              <path d="M 0 -13 C 9 0, 9 11, 0 11 C -9 11, -9 0, 0 -13 Z" fill="#8EE0FF" stroke={ink} strokeWidth="2.8" />
              <circle cx="-2.5" cy="1" r="2" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

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
  const spec =
    (charactersData.cast as Record<string, any>)[characterId] ||
    charactersData.cast.taster_protagonist;
  const charFrame = stepOnTwos ? Math.floor(rawFrame / 2) * 2 : rawFrame;

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

  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 2.5;
  const talkNod = rmsAmplitude > 0.18 ? Math.sin(charFrame * 0.65) * 3.2 * rmsAmplitude : 0;
  const finalScale = scale * (spec.heightScale ?? 1.0);

  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.56, 28]} />
        <meshBasicMaterial color="#1A203A" transparent opacity={0.32} />
      </mesh>
      <Html transform distanceFactor={4.1} position={[0, 1.18, 0]} style={{ pointerEvents: "none", userSelect: "none" }}>
        <CutoutCharacterSvg
          characterId={characterId}
          emotion={emotion}
          rmsAmplitude={rmsAmplitude}
          spectralCentroid={spectralCentroid}
          isBlinking={isBlinking}
          breathY={breathY}
          talkNod={talkNod}
        />
      </Html>
    </group>
  );
};
