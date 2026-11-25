import React from "react";
import { AbsoluteFill } from "remotion";
import charactersData from "../data/characters.json";
import { CharacterId, CharacterSvg } from "../components/CharacterSvg";
import { EmotionName } from "../utils/emotions";

const TEST_EXPRESSIONS: EmotionName[] = ["neutral", "happy_relief", "shocked", "skeptical", "sad_slump", "nervous_sweat"];

/** Live consistency sheet: every character, same rig, same 5 expressions, rendered from characters.json. */
export const CharacterConsistencySheet: React.FC<{ ids?: string[] }> = ({ ids }) => {
  const entries = Object.entries(charactersData.cast).filter(([id, spec]: [string, any]) => (ids && ids.length ? ids.includes(id) : !spec.isHost));
  if (ids && ids.length) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#F8F2E4", padding: 20, flexDirection: "row", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
        {entries.map(([id, spec]: [string, any]) => (
          <div key={id} style={{ width: 300, textAlign: "center", fontFamily: "sans-serif", fontWeight: 900 }}>
            <CharacterSvg characterId={id as CharacterId} emotion="neutral" width={290} height={414} uid={`${id}-big`} />
            <div>{spec.displayName}</div>
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#F8F2E4", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#FFF6E0", backgroundColor: "#181E2C", padding: "10px 20px", borderRadius: 10, marginBottom: 12 }}>
        RICK-169 CHARACTER CONSISTENCY SHEET (LIVE RIG: CharacterSvg + src/data/characters.json) - {entries.length} characters
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {entries.map(([id, spec]: [string, any]) => (
          <div key={id} style={{ backgroundColor: "#FFFBF0", border: "3px solid #141414", borderRadius: 14, padding: "8px 10px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 2 }}>
              <div style={{ backgroundColor: spec.roleTagColor, color: "#FFF", borderRadius: 8, border: "2px solid #141414", padding: "4px 10px", fontWeight: 900, fontSize: 16 }}>{spec.displayName}</div>
              <div style={{ fontSize: 12, color: "#475569" }}>{spec.roleLabel} · {spec.outfit} · {spec.hairStyle} · h{spec.heightScale}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 125 }}>
              {TEST_EXPRESSIONS.map((exp) => (
                <div key={exp} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ transform: `scale(${spec.heightScale ?? 1})`, transformOrigin: "50% 100%" }}>
                    <CharacterSvg characterId={id as CharacterId} emotion={exp} width={80} height={114} uid={`${id}-${exp}`} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#242A38", marginTop: -4 }}>{exp.replace("_", " ")}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
