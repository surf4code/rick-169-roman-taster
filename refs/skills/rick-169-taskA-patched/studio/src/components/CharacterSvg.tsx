import React from "react";
import charactersData from "../data/characters.json";
import { EMOTION_LIBRARY, EmotionName } from "../utils/emotions";

export type CharacterId = keyof typeof charactersData.cast;

export interface CharacterSvgProps {
  characterId: CharacterId;
  emotion: EmotionName;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  isBlinking?: boolean;
  breathY?: number;
  talkNod?: number;
  width?: number;
  height?: number;
  uid?: string;
}

export const CharacterSvg: React.FC<CharacterSvgProps> = ({
  characterId,
  emotion,
  rmsAmplitude = 0,
  spectralCentroid = 0.5,
  isBlinking = false,
  breathY = 0,
  talkNod = 0,
  width = 280,
  height = 400,
  uid = "0",
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
  if (rmsAmplitude >= 0.14 && rmsAmplitude < 0.42) viseme = "mid";
  else if (rmsAmplitude >= 0.42) viseme = spectralCentroid < 0.38 ? "o" : "open";

  const ink = "#161618";
  const skin = "#FDFAF4";
  const shirt = spec.bodyColor;
  const accent = spec.accentColor;
  const clipTorsoId = `torso-clip-${characterId}-${uid}`;
  const clipHeadId = `head-clip-${characterId}-${uid}`;

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

        {/* Plump Rounded Pill Torso (Clipped Outfit + Cel Shading) */}
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

        {/* Wide Marshmallow Head (Zero Neck) */}
        <g transform={`translate(0, -84) rotate(${pose.headTiltDeg + talkNod})`}>
          <g clipPath={`url(#${clipHeadId})`}>
            <ellipse cx="0" cy="-6" rx="52" ry="45" fill={skin} />
            <ellipse cx="-40" cy="6" rx="34" ry="54" fill="#D6D2D6" />
            <ellipse cx="32" cy="-24" rx="22" ry="26" fill="#FFFFFF" opacity="0.45" />
          </g>
          <ellipse cx="0" cy="-6" rx="52" ry="45" fill="none" stroke={ink} strokeWidth="5.2" />

          {/* Role Hair / Headgear */}
          {spec.hairStyle === "messy_tuft" && (
            <path
              d="M -46 -18 L -38 -42 L -16 -52 L 0 -46 L 14 -56 L 34 -42 L 46 -18 L 24 -32 L 0 -35 L -24 -32 Z"
              fill={spec.hairColor || "#764822"}
              stroke={ink}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
          {spec.hairStyle === "laurel_wreath" && (
            <path d="M -42 -32 Q 0 -54 42 -32" fill="none" stroke="#F0B826" strokeWidth="9" strokeLinecap="round" />
          )}
          {spec.hairStyle === "tied_bun" && (
            <>
              <circle cx="0" cy="-54" r="16" fill={spec.hairColor || "#623824"} stroke={ink} strokeWidth="4" />
              <path d="M -46 -14 Q 0 -54 46 -14 Q 0 -34 -46 -14 Z" fill={spec.hairColor || "#623824"} stroke={ink} strokeWidth="4" />
            </>
          )}
          {spec.hairStyle === "helmet_crest" && (
            <>
              <path d="M -14 -48 A 14 22 0 0 1 14 -48 Z" fill="#D41C24" stroke={ink} strokeWidth="4" />
              <path d="M -52 -18 A 52 44 0 0 1 52 -18 Z" fill="#D6A64E" stroke={ink} strokeWidth="4.8" />
            </>
          )}
          {spec.hairStyle === "bald_ring" && (
            <>
              <path d="M -52 -16 C -54 -34, -36 -36, -34 -18 Z" fill="#30343C" stroke={ink} strokeWidth="3.2" />
              <path d="M 52 -16 C 54 -34, 36 -36, 34 -18 Z" fill="#30343C" stroke={ink} strokeWidth="3.2" />
            </>
          )}

          {/* Eyes */}
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
                  <line x1="-25" y1="-11" x2="-7" y2="-11" stroke={ink} strokeWidth="3.8" />
                  <line x1="7" y1="-11" x2="25" y2="-11" stroke={ink} strokeWidth="3.8" />
                </>
              )}
            </>
          )}

          {/* Thick Floating Rounded Eyebrows */}
          <line x1="-26" y1="-23" x2="-7" y2="-23" stroke={ink} strokeWidth="5.2" strokeLinecap="round" transform={`rotate(${pose.browLeftDeg}, -16, -23)`} />
          <line x1="7" y1="-23" x2="26" y2="-23" stroke={ink} strokeWidth="5.2" strokeLinecap="round" transform={`rotate(${pose.browRightDeg}, 16, -23)`} />

          {/* Mouth */}
          {isAngry ? (
            <rect x="-15" y="10" width="30" height="12" rx="5" fill="#FFFFFF" stroke={ink} strokeWidth="3.4" />
          ) : isShock || viseme === "open" ? (
            <g>
              <path d="M -16 8 L 16 8 C 16 26, -16 26, -16 8 Z" fill="#3A1218" stroke={ink} strokeWidth="3.4" />
              <rect x="-12" y="9" width="24" height="5" rx="2" fill="#FFFFFF" />
              <ellipse cx="0" cy="21" rx="8" ry="4" fill="#EC5C72" />
            </g>
          ) : viseme === "mid" ? (
            <rect x="-12" y="10" width="24" height="10" rx="5" fill="#3A1218" stroke={ink} strokeWidth="3.2" />
          ) : viseme === "o" ? (
            <ellipse cx="0" cy="16" rx="8" ry="10" fill="#3A1218" stroke={ink} strokeWidth="3.4" />
          ) : (
            <path d="M -10 14 Q 0 20 10 14" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
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
