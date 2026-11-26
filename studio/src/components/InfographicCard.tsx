import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Miko-style infographic card on a warm painted backdrop. Every element springs in with a 0.15s stagger. */
export const InfographicCard: React.FC<{ title: string; stat: string; sub: string; items: string[] }> = ({ title, stat, sub, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (delay: number, damping = 11) => spring({ frame: frame - delay, fps, config: { damping, stiffness: 190, mass: 0.7 } });
  const card = pop(0, 14), tag = pop(5), big = pop(11), sub_ = pop(19);
  const sc = (v: number) => `scale(${Math.max(0, v)})`;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #F1B95C 0%, #D9893A 60%, #B8602E 100%)", justifyContent: "center", alignItems: "center", fontFamily: "'Arial Black', Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: "repeating-linear-gradient(45deg, #7B1E1E 0 24px, transparent 24px 48px)", transform: `translateX(${frame * 0.6}px)` }} />
      <div style={{ width: 1500, padding: "50px 70px 60px", backgroundColor: "#F8E8C4", border: "9px solid #141414", borderRadius: 36, boxShadow: "16px 16px 0 #141414", transform: `scale(${0.8 + 0.2 * card}) rotate(${-0.6 - (1 - card) * 3}deg) translateY(${(1 - card) * 60}px)`, opacity: Math.min(1, card * 1.6), position: "relative" }}>
        <div style={{ position: "absolute", top: -34, left: 60, background: "#B5452F", color: "#FFF6E0", border: "6px solid #141414", borderRadius: 14, padding: "6px 26px", fontSize: 38, letterSpacing: 2, transform: sc(tag), transformOrigin: "left center" }}>{title}</div>
        <div style={{ fontSize: 190, fontWeight: 900, color: "#7B1E1E", lineHeight: 1, marginTop: 24, textShadow: "6px 6px 0 #141414", transform: `${sc(big)} translateY(${(1 - big) * 30}px)`, transformOrigin: "left center" }}>{stat}</div>
        <div style={{ fontSize: 50, color: "#2A2230", margin: "8px 0 44px", fontWeight: 800, fontStyle: "italic", opacity: Math.min(1, sub_ * 1.5), transform: `translateX(${(1 - sub_) * -80}px)` }}>= {sub}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
          {items.map((it, i) => {
            const p = pop(28 + i * 5);
            return (
              <div key={i} style={{ backgroundColor: ["#2E8B8B", "#B03A2E", "#E7B833", "#5B7FBF"][i % 4], color: i === 2 ? "#141414" : "#FFF8E8", border: "6px solid #141414", borderRadius: 22, padding: "30px 16px", textAlign: "center", fontSize: 32, fontWeight: 900, lineHeight: 1.1, boxShadow: "6px 6px 0 #141414", transform: `${sc(p)} rotate(${(1 - p) * -8}deg)` }}>
                {it}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
