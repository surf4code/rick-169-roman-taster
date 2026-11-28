import React from "react";
import { AbsoluteFill } from "remotion";
import charactersData from "../data/characters.json";
import { CharacterId, CharacterSvg } from "../components/CharacterSvg";
import { EmotionName } from "../utils/emotions";

const TEST_EXPRESSIONS: EmotionName[] = [
  "neutral",
  "happy_relief",
  "shocked",
  "skeptical",
  "nervous_sweat",
  "angry_glare",
];

export const CharacterConsistencySheet: React.FC = () => {
  const entries = Object.entries(charactersData.cast).filter(([, spec]: [string, any]) => !spec.isHost);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F8F2E4", padding: 28, fontFamily: "sans-serif" }}>
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: "#FFF6E0",
          backgroundColor: "#181E2C",
          padding: "14px 24px",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        RICK-169 CHARACTER CONSISTENCY SHEET (LIVE RIG: CharacterSvg + src/data/characters.json)
      </div>
      <div style={{ display: "grid", gridTemplateRows: `repeat(${entries.length}, 1fr)`, gap: 10, flex: 1 }}>
        {entries.map(([id, spec]: [string, any], rowIdx) => (
          <div
            key={id}
            style={{
              display: "grid",
              gridTemplateColumns: "240px repeat(6, 1fr)",
              gap: 10,
              alignItems: "center",
              backgroundColor: rowIdx % 2 === 1 ? "#F0E8D6" : "transparent",
              borderRadius: 10,
              padding: "4px 12px",
            }}
          >
            <div
              style={{
                backgroundColor: spec.roleTagColor,
                color: "#FFFFFF",
                borderRadius: 12,
                border: "3px solid #141414",
                padding: "12px 16px",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 19 }}>{spec.displayName}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{spec.roleLabel || id}</div>
            </div>
            {TEST_EXPRESSIONS.map((exp) => (
              <div key={exp} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <CharacterSvg
                  characterId={id as CharacterId}
                  emotion={exp}
                  width={108}
                  height={154}
                  uid={`${id}-${exp}`}
                />
                <div style={{ fontSize: 13, fontWeight: 800, color: "#242A38", marginTop: -6 }}>
                  {exp.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
