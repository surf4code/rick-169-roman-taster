import React from "react";
import { AbsoluteFill } from "remotion";
import charactersData from "../data/characters.json";

const TEST_EXPRESSIONS = ["neutral", "happy_relief", "shocked", "skeptical", "nervous_sweat", "angry_glare"];

export const CharacterConsistencySheet: React.FC = () => {
  const entries = Object.entries(charactersData.cast);
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFBF2", padding: 36, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 34, fontWeight: 900, color: "#141414", marginBottom: 18 }}>
        RICK-169 CHARACTER CONSISTENCY TEST SHEET (SINGLE SOURCE: src/data/characters.json)
      </div>
      <div style={{ display: "grid", gridTemplateRows: `repeat(${entries.length}, 1fr)`, gap: 14, flex: 1 }}>
        {entries.map(([id, spec]: [string, any]) => (
          <div key={id} style={{ display: "grid", gridTemplateColumns: "240px repeat(6, 1fr)", gap: 12, alignItems: "center", borderBottom: "2px solid #CBD5E1", paddingBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: spec.roleTagColor }}>
              {spec.displayName}<div style={{ fontSize: 14, color: "#475569" }}>{spec.headShape} / {spec.bodyColor}</div>
            </div>
            {TEST_EXPRESSIONS.map((exp) => (
              <div key={exp} style={{ backgroundColor: "#F8FAFC", border: "2px solid #141414", borderRadius: 12, padding: 10, textAlign: "center" }}>
                <div style={{ width: 42, height: 48, borderRadius: "50%", backgroundColor: "#F6EFE4", border: "3px solid #141414", margin: "0 auto 6px" }} />
                <div style={{ width: 34, height: 22, borderRadius: 6, backgroundColor: spec.bodyColor, border: "3px solid #141414", margin: "0 auto 6px" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#141414" }}>{exp}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
