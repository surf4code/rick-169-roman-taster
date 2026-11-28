import React from "react";
import { AbsoluteFill } from "remotion";

export type AkiraExpression = "deadpan" | "smirk" | "shout" | "wide-eyed" | "big_grin";

export const AkiraCutaway: React.FC<{ expression: AkiraExpression; bubbleText?: string }> = ({
  expression,
  bubbleText,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#9CAF88", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{
        width: 520, height: 640, borderRadius: 36, backgroundColor: "#F6EFE4", border: "7px solid #141414",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "12px 12px 0px #141414"
      }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#141414" }}>AKIRA (HOST)</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#4D7C0F", marginTop: 12 }}>EXPRESSION: {expression.toUpperCase()}</div>
        <div style={{ fontSize: 20, color: "#475569", marginTop: 20, textAlign: "center", padding: "0 32px" }}>
          Replace with public/assets/akira_ref.png once supplied.
        </div>
      </div>
      {bubbleText && (
        <div style={{
          position: "absolute", top: 90, right: 140, backgroundColor: "#FFFFFF", border: "6px solid #141414",
          borderRadius: 48, padding: "24px 40px", fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "#141414"
        }}>
          {bubbleText}
        </div>
      )}
    </AbsoluteFill>
  );
};
