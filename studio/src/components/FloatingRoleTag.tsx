// Screen-space role tag pinned above a character's projected head.
// Was a 3D drei <Text> (which fetches a font from the network at render time);
// now plain DOM, so it always renders in Remotion and CI.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FloatingRoleTag: React.FC<{
  label: string;
  x: number; // px, anchor = bottom-centre of the pointer
  y: number;
  appearFrame: number;
  accentColor?: string;
}> = ({ label, x, y, appearFrame, accentColor = "#2563EB" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < appearFrame) return null;
  const pop = spring({ frame: frame - appearFrame, fps, config: { damping: 12, stiffness: 170 } });
  const hoverY = Math.sin(frame * 0.09) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + hoverY,
        transform: `translate(-50%, -100%) scale(${pop})`,
        transformOrigin: "50% 100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFBF2",
          border: `5px solid ${accentColor}`,
          outline: "3px solid #201628",
          borderRadius: 22,
          padding: "8px 22px",
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 1,
          color: "#201628",
          whiteSpace: "nowrap",
          boxShadow: "0 6px 0 rgba(32,22,40,0.25)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: `16px solid ${accentColor}`,
          marginTop: -1,
        }}
      />
    </div>
  );
};
