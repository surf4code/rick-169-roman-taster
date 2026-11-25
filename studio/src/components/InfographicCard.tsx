import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Miko-style infographic card on a warm painted backdrop (kept out of the near-white range so the grade stays warm). */
export const InfographicCard: React.FC<{ title: string; stat: string; sub: string; items: string[] }> = ({ title, stat, sub, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #F1B95C 0%, #D9893A 60%, #B8602E 100%)", justifyContent: "center", alignItems: "center", fontFamily: "'Arial Black', Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: "repeating-linear-gradient(45deg, #7B1E1E 0 24px, transparent 24px 48px)" }} />
      <div style={{ width: 1500, padding: "50px 70px 60px", backgroundColor: "#F8E8C4", border: "9px solid #141414", borderRadius: 36, boxShadow: "16px 16px 0 #141414", transform: `scale(${0.92 + 0.08 * pop}) rotate(-0.6deg)`, position: "relative" }}>
        <div style={{ position: "absolute", top: -34, left: 60, background: "#B5452F", color: "#FFF6E0", border: "6px solid #141414", borderRadius: 14, padding: "6px 26px", fontSize: 38, letterSpacing: 2 }}>{title}</div>
        <div style={{ fontSize: 190, fontWeight: 900, color: "#7B1E1E", lineHeight: 1, marginTop: 24, textShadow: "6px 6px 0 #141414" }}>{stat}</div>
        <div style={{ fontSize: 50, color: "#2A2230", margin: "8px 0 44px", fontWeight: 800, fontStyle: "italic" }}>= {sub}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
          {items.map((it, i) => (
            <div key={i} style={{ backgroundColor: ["#2E8B8B", "#B03A2E", "#E7B833", "#5B7FBF"][i % 4], color: i === 2 ? "#141414" : "#FFF8E8", border: "6px solid #141414", borderRadius: 22, padding: "30px 16px", textAlign: "center", fontSize: 32, fontWeight: 900, lineHeight: 1.1, boxShadow: "6px 6px 0 #141414" }}>
              {it}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
