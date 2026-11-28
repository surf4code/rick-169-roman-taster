import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const InfographicCard: React.FC<{
  title: string;
  stat: string;
  sub: string;
  items: string[];
}> = ({ title, stat, sub, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EBD4", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{
        width: 1440, padding: "56px 72px", backgroundColor: "#FFFBF2", border: "7px solid #141414",
        borderRadius: 32, boxShadow: "14px 14px 0px #141414", transform: `scale(${0.92 + 0.08 * pop})`
      }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#9A3412", letterSpacing: 2 }}>{title}</div>
        <div style={{ fontSize: 108, fontWeight: 900, color: "#141414", margin: "12px 0" }}>{stat}</div>
        <div style={{ fontSize: 30, color: "#334155", marginBottom: 38 }}>{sub}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              backgroundColor: "#FEF3C7", border: "4px solid #141414", borderRadius: 20,
              padding: "28px 18px", textAlign: "center", fontSize: 26, fontWeight: 800, color: "#141414"
            }}>
              {it}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
