import React from "react";
import * as THREE from "three";
import { spring } from "remotion";
import { CamState } from "../utils/cameraModes";

/** Projects a world point to 1920x1080 screen px using the same camera as the 3D canvas. */
export function projectToScreen(world: [number, number, number], cs: CamState, w = 1920, h = 1080) {
  const cam = new THREE.PerspectiveCamera(cs.fov, w / h, 0.05, 80);
  cam.position.set(...cs.pos);
  cam.up.set(Math.sin(cs.roll), Math.cos(cs.roll), 0);
  cam.lookAt(...cs.look);
  cam.updateMatrixWorld(true);
  const v = new THREE.Vector3(...world).project(cam);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1 };
}

const FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

/** Miko-style floating role tag, drawn in DOM so frame capture always sees it. */
export const RoleTag: React.FC<{ x: number; y: number; text: string; color: string; frame: number; appearFrame: number; fps: number }> = ({ x, y, text, color, frame, appearFrame, fps }) => {
  if (frame < appearFrame) return null;
  const pop = spring({ frame: frame - appearFrame, fps, config: { damping: 11, stiffness: 190 } });
  const bob = Math.sin(frame * 0.09) * 5;
  const cx = Math.min(1920 - 40, Math.max(40, x));
  return (
    <div style={{ position: "absolute", left: cx, top: y + bob, transform: `translate(-50%, -100%) scale(${pop})`, transformOrigin: "50% 100%", fontFamily: FONT }}>
      <div style={{ background: "#FFFBF2", border: `5px solid ${color}`, boxShadow: "5px 5px 0 #141414", borderRadius: 18, padding: "8px 22px", fontSize: 34, fontWeight: 900, color: "#141414", whiteSpace: "nowrap", letterSpacing: 1 }}>
        {text}
      </div>
      <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `20px solid ${color}` }} />
    </div>
  );
};

/** Comic speech bubble anchored over the speaker's head. */
export const Bubble: React.FC<{ x: number; y: number; text: string; frame: number; appearFrame: number; fps: number }> = ({ x, y, text, frame, appearFrame, fps }) => {
  if (frame < appearFrame) return null;
  const pop = spring({ frame: frame - appearFrame, fps, config: { damping: 13, stiffness: 200 } });
  const cx = Math.min(1920 - 340, Math.max(340, x));
  const cy = Math.max(170, y);
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -100%) scale(${pop})`, transformOrigin: "50% 100%", fontFamily: FONT }}>
      <div style={{ background: "#FFFFFF", border: "6px solid #141414", borderRadius: 44, padding: "18px 38px", fontSize: 44, fontWeight: 900, fontStyle: "italic", color: "#141414", maxWidth: 640, textAlign: "center", lineHeight: 1.05, boxShadow: "6px 6px 0 rgba(20,20,20,0.9)" }}>
        {text}
      </div>
      <div style={{ width: 0, height: 0, marginLeft: Math.min(560, Math.max(60, 320 + (x - cx))), borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "28px solid #141414" }} />
    </div>
  );
};

const MIKO_FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const WHITE = "#F4F0E8";
/** Miko's location/time plate: dark navy glass box, double rounded white border, bold white geometric caps. */
const MikoBox: React.FC<{ children: React.ReactNode; size: number; pad: [number, number]; track: number; style?: React.CSSProperties }> = ({ children, size, pad, track, style }) => (
  <div style={{ border: `3px solid ${WHITE}`, borderRadius: 16, padding: 5, boxShadow: "0 8px 26px rgba(8,4,16,0.5)", display: "inline-block", ...style }}>
    <div style={{ border: `2px solid ${WHITE}`, borderRadius: 10, background: "rgba(26,22,54,0.88)", padding: `${pad[0]}px ${pad[1]}px`, color: WHITE, fontFamily: MIKO_FONT, fontWeight: 900, fontSize: size, letterSpacing: track, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1.05, textAlign: "center" }}>
      {children}
    </div>
  </div>
);

/** Miko-style floating role tag: calm fade/rise, thin leader line, no bounce. Time-based so 30 and 60 fps match. */
export const MikoTag: React.FC<{ x: number; y: number; text: string; color: string; frame: number; appearFrame: number; fps: number }> = ({ x, y, text, color, frame, appearFrame, fps }) => {
  if (frame < appearFrame) return null;
  const a = spring({ frame: frame - appearFrame, fps, config: { damping: 26, stiffness: 70 } });
  const float = Math.sin((frame / fps) * 1.35) * 3;
  const cx = Math.min(1920 - 40, Math.max(40, x));
  return (
    <div style={{ position: "absolute", left: cx, top: Math.max(120, y) + float + (1 - a) * 18, opacity: a, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <MikoBox size={26} pad={[8, 22]} track={3}>
        <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 6, background: color, marginRight: 12, boxShadow: `0 0 10px ${color}` }} />{text}
      </MikoBox>
      <div style={{ width: 2, height: 30, background: `linear-gradient(${WHITE}, rgba(244,240,232,0))` }} />
    </div>
  );
};

/** Location/time plate in Miko's exact "DAY TWO" format: top-left, one line, e.g. "ROME, 31 AD". */
export const MikoPlate: React.FC<{ text: string; sub?: string; frame: number; appearFrame: number; fps: number; fadeOutAt?: number }> = ({ text, sub, frame, appearFrame, fps, fadeOutAt }) => {
  if (frame < appearFrame) return null;
  const a = spring({ frame: frame - appearFrame, fps, config: { damping: 30, stiffness: 60 } });
  const out = fadeOutAt === undefined ? 1 : 1 - Math.min(1, Math.max(0, (frame - fadeOutAt) / (fps * 0.33)));
  const short = !!sub && sub.length <= 10;
  return (
    <div style={{ position: "absolute", top: 70, left: 86, opacity: a * out, transform: `translateY(${(1 - a) * -14}px)` }}>
      <MikoBox size={50} pad={[12, 36]} track={5}>
        {short ? `${text}, ${sub}` : text}
        {!short && sub && <div style={{ fontSize: 20, letterSpacing: 3, fontWeight: 700, marginTop: 6, opacity: 0.9 }}>{sub}</div>}
      </MikoBox>
    </div>
  );
};
