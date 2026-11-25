import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { CharacterSvg } from "./CharacterSvg";
import { EmotionName } from "../utils/emotions";

export type AkiraExpression = "deadpan" | "smirk" | "shout" | "wide-eyed" | "big_grin";
const MAP: Record<AkiraExpression, EmotionName> = { deadpan: "neutral", smirk: "skeptical", shout: "angry_glare", "wide-eyed": "shocked", big_grin: "happy_relief" };

/** Akira host cutaway: sage backdrop, the SAME rig as every other character (replace with Akira's final design when supplied). */
export const AkiraCutaway: React.FC<{ expression: AkiraExpression; bubbleText?: string }> = ({ expression, bubbleText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 170 } });
  const blink = frame % 70 > 66;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #B7C8A2 0%, #9CAF88 55%, #86996F 100%)", fontFamily: "'Arial Black', Arial, sans-serif" }}>
      <div style={{ position: "absolute", left: 960 - 330, top: 1080 - 190, width: 660, height: 90, borderRadius: "50%", background: "rgba(40,60,40,0.28)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", left: 960 - 490 - 40, top: -40, transform: `scale(${0.9 + 0.1 * pop})`, transformOrigin: "50% 100%" }}>
        <CharacterSvg characterId={"akira" as any} emotion={MAP[expression]} width={560 * 1.75} height={800 * 1.75} isBlinking={blink} breathY={Math.sin(frame * 0.1) * 2} uid="akira-host" />
      </div>
      {bubbleText && (
        <div style={{ position: "absolute", top: 120, right: 220, background: "#FFFFFF", border: "7px solid #141414", borderRadius: 50, padding: "22px 46px", fontSize: 64, fontWeight: 900, fontStyle: "italic", color: "#141414", transform: `scale(${pop})`, boxShadow: "8px 8px 0 #141414" }}>
          {bubbleText}
        </div>
      )}
      <div style={{ position: "absolute", left: 60, bottom: 50, background: "#141414", color: "#FFF6E0", padding: "8px 22px", borderRadius: 12, fontSize: 30, letterSpacing: 2 }}>AKIRA · HOST</div>
    </AbsoluteFill>
  );
};
