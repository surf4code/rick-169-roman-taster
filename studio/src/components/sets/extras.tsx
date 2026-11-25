import React, { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../utils/anim";
import * as P from "../props/RomanProps";
import type { SetSpec } from "./dressing";

/** Extra architectural + decor detail layered on every set: dado, meander frieze, cornice, pilasters, framed
 *  paintings, wall stains, floor wear, baseboards and small floor clutter. Everything is deterministic per set. */

const hash = (s: string) => s.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
const TEX: Record<string, THREE.CanvasTexture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = false) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
  return (TEX[key] = t);
};

const friezeTex = () => canvasTex("frieze", 256, 64, (g) => {
  g.fillStyle = "#EBD9AC"; g.fillRect(0, 0, 256, 64);
  g.fillStyle = "#B5452F"; g.fillRect(0, 0, 256, 7); g.fillRect(0, 57, 256, 7);
  g.strokeStyle = "#6E2A1C"; g.lineWidth = 5; g.lineJoin = "miter";
  for (let i = 0; i < 4; i++) { const x = i * 64 + 6; g.beginPath(); g.moveTo(x, 50); g.lineTo(x, 14); g.lineTo(x + 40, 14); g.lineTo(x + 40, 40); g.lineTo(x + 18, 40); g.lineTo(x + 18, 28); g.stroke(); }
  g.fillStyle = "rgba(60,30,10,0.08)"; for (let i = 0; i < 200; i++) g.fillRect(Math.random() * 256, Math.random() * 64, 2, 2);
}, true);

const dadoTex = (base: string) => canvasTex("dado" + base, 128, 256, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 128, 256);
  g.fillStyle = "rgba(255,255,255,0.07)"; for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 2, 0, 3, 256);
  g.strokeStyle = "rgba(30,10,5,0.35)"; g.lineWidth = 3; g.strokeRect(10, 14, 108, 210);
  g.strokeStyle = "rgba(255,225,160,0.55)"; g.lineWidth = 2; g.strokeRect(18, 22, 92, 194);
  for (let i = 0; i < 240; i++) { g.fillStyle = `rgba(30,12,6,${Math.random() * 0.06})`; g.fillRect(Math.random() * 128, Math.random() * 256, 3, 3); }
}, true);

const stainTex = () => canvasTex("stain", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(70,45,25,0.5)"); gr.addColorStop(0.6, "rgba(70,45,25,0.18)"); gr.addColorStop(1, "rgba(70,45,25,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

const paintTex = (k: number) => canvasTex("paint" + k, 256, 192, (g) => {
  const sky = ["#9ED0E8", "#F2C48D", "#B9D9A0", "#D9B3C8"][k % 4];
  g.fillStyle = sky; g.fillRect(0, 0, 256, 192);
  g.fillStyle = "#E9D6A7"; g.fillRect(0, 130, 256, 62);
  if (k % 4 === 0) { g.fillStyle = "#F4EFE4"; for (let i = 0; i < 4; i++) g.fillRect(30 + i * 56, 40, 20, 100); g.fillStyle = "#C8643B"; g.fillRect(14, 28, 228, 14); }
  else if (k % 4 === 1) { g.strokeStyle = "#4C7A3A"; g.lineWidth = 12; g.beginPath(); g.arc(128, 96, 56, 0, Math.PI * 2); g.stroke(); g.fillStyle = "#B5452F"; g.beginPath(); g.arc(128, 40, 9, 0, 7); g.arc(128, 152, 9, 0, 7); g.fill(); }
  else if (k % 4 === 2) { g.fillStyle = "#6E8F52"; g.beginPath(); g.moveTo(0, 150); g.lineTo(70, 70); g.lineTo(130, 150); g.fill(); g.fillStyle = "#4F7440"; g.beginPath(); g.moveTo(90, 150); g.lineTo(170, 56); g.lineTo(256, 150); g.fill(); g.fillStyle = "#FFE08A"; g.beginPath(); g.arc(200, 34, 18, 0, 7); g.fill(); }
  else { g.strokeStyle = "#8C2F39"; g.lineWidth = 8; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(10 + i * 50, 10); g.lineTo(60 + i * 50, 180); g.stroke(); } }
  g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 6; g.strokeRect(0, 0, 256, 192);
});

const Frame: React.FC<{ p: [number, number, number]; ry?: number; w: number; h: number; k: number }> = ({ p, ry = 0, w, h, k }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <mesh><boxGeometry args={[w + 0.16, h + 0.16, 0.07]} /><meshStandardMaterial color="#6B4426" roughness={0.7} /></mesh>
    <mesh position={[0, 0, 0.04]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={paintTex(k)} roughness={0.9} /></mesh>
    <mesh position={[0, 0, 0.037]}><boxGeometry args={[w + 0.04, h + 0.04, 0.02]} /><meshStandardMaterial color="#C9A455" roughness={0.6} metalness={0.2} /></mesh>
  </group>
);

export const SetDressing: React.FC<{ spec: SetSpec; setId: string; night: boolean; frame: number }> = ({ spec, setId, night, frame }) => {
  const rng = useMemo(() => mulberry32(hash(setId)), [setId]);
  const { halfW, backZ, floorZ, floorD, wallH } = spec;
  const dadoBase = spec.wall === "brick" ? "#6B4A34" : spec.wall === "stone" ? "#59586A" : "#9C3B2C";
  const dado = dadoTex(dadoBase);
  const fr = friezeTex();
  const W = halfW * 2;
  const stage = useMemo(() => {
    const r = mulberry32(hash(setId) ^ 0x9e37);
    const stains = Array.from({ length: 7 }, () => ({ x: (r() - 0.5) * W * 0.9, y: 1.4 + r() * 3.2, s: 0.9 + r() * 1.6, o: 0.25 + r() * 0.3 }));
    const wear = Array.from({ length: 9 }, () => ({ x: (r() - 0.5) * W * 0.8, z: backZ + 0.4 + r() * (floorD * 0.35), s: 0.8 + r() * 1.6, o: 0.18 + r() * 0.22 }));
    const pics = Array.from({ length: Math.max(2, Math.floor(W / 4.2)) }, (_, i) => ({ x: -halfW + 1.6 + i * ((W - 3.2) / Math.max(1, Math.floor(W / 4.2) - 1)), k: i + Math.floor(r() * 4), w: 0.9 + r() * 0.4, y: 3.4 + r() * 0.5 }));
    const clutter = Array.from({ length: 7 }, () => ({ t: ["Scroll", "Bowl", "Jug", "Loaf"][Math.floor(r() * 4)], x: -halfW + 0.6 + r() * (W - 1.2), z: backZ + 0.35 + r() * 0.5, ry: r() * 6.28, s: 0.8 + r() * 0.3 }));
    return { stains, wear, pics, clutter };
  }, [setId]);
  const MAP: Record<string, React.FC<any>> = { Scroll: P.Scroll, Bowl: P.Bowl, Jug: P.Jug, Loaf: P.Loaf };
  const flick = 0.9 + 0.1 * Math.sin(frame * 0.37) * Math.sin(frame * 0.11 + 1);
  const dadoRep = Math.max(2, Math.round(W / 2));
  const sideRep = Math.max(2, Math.round(floorD / 2));
  const dadoMat = (rep: number) => { const t = dado.clone(); t.repeat.set(rep, 1); t.needsUpdate = true; return t; };
  const dBack = useMemo(() => dadoMat(dadoRep), [dadoRep, dadoBase]);
  const dSide = useMemo(() => dadoMat(sideRep), [sideRep, dadoBase]);
  const fBack = useMemo(() => { const t = fr.clone(); t.repeat.set(W / 1.2, 1); t.needsUpdate = true; return t; }, [W]);
  const fSide = useMemo(() => { const t = fr.clone(); t.repeat.set(floorD / 1.2, 1); t.needsUpdate = true; return t; }, [floorD]);
  const wood = <meshStandardMaterial color="#5A3820" roughness={0.75} />;
  const plaster = <meshStandardMaterial color="#EBD8B0" roughness={0.9} />;

  return (
    <group>
      {/* back wall: dado, frieze, cornice, baseboard */}
      <mesh position={[0, 0.55, backZ + 0.012]}><planeGeometry args={[W, 1.1]} /><meshStandardMaterial map={dBack} roughness={0.9} /></mesh>
      <mesh position={[0, 1.18, backZ + 0.03]}><boxGeometry args={[W, 0.1, 0.07]} />{wood}</mesh>
      <mesh position={[0, 1.62, backZ + 0.012]}><planeGeometry args={[W, 0.5]} /><meshStandardMaterial map={fBack} roughness={0.9} /></mesh>
      <mesh position={[0, wallH - 0.5, backZ + 0.06]}><boxGeometry args={[W, 0.22, 0.14]} />{plaster}</mesh>
      <mesh position={[0, wallH - 0.34, backZ + 0.1]}><boxGeometry args={[W, 0.1, 0.1]} />{wood}</mesh>
      <mesh position={[0, 0.09, backZ + 0.05]}><boxGeometry args={[W, 0.18, 0.1]} />{wood}</mesh>
      {/* side walls */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh position={[sx * (halfW - 0.012), 0.55, floorZ]} rotation={[0, -sx * Math.PI / 2, 0]}><planeGeometry args={[floorD, 1.1]} /><meshStandardMaterial map={dSide} roughness={0.9} /></mesh>
          <mesh position={[sx * (halfW - 0.03), 1.18, floorZ]}><boxGeometry args={[0.07, 0.1, floorD]} />{wood}</mesh>
          <mesh position={[sx * (halfW - 0.012), 1.62, floorZ]} rotation={[0, -sx * Math.PI / 2, 0]}><planeGeometry args={[floorD, 0.5]} /><meshStandardMaterial map={fSide} roughness={0.9} /></mesh>
          <mesh position={[sx * (halfW - 0.06), wallH - 0.5, floorZ]}><boxGeometry args={[0.14, 0.22, floorD]} />{plaster}</mesh>
          <mesh position={[sx * (halfW - 0.05), 0.09, floorZ]}><boxGeometry args={[0.1, 0.18, floorD]} />{wood}</mesh>
        </group>
      ))}
      {/* pilasters with capitals and bases */}
      {[-1, -0.5, 0, 0.5, 1].map((u, i) => {
        const x = u * (halfW - 0.6);
        return (
          <group key={i} position={[x, 0, backZ + 0.1]}>
            <mesh position={[0, 3.2, 0]}><boxGeometry args={[0.34, 4.6, 0.12]} /><meshStandardMaterial color="#F0E4C8" roughness={0.85} /></mesh>
            {[-0.09, 0.09].map((dx) => <mesh key={dx} position={[dx, 3.2, 0.07]}><boxGeometry args={[0.035, 4.5, 0.03]} /><meshStandardMaterial color="#C9B88F" roughness={0.9} /></mesh>)}
            <mesh position={[0, 5.58, 0.02]}><boxGeometry args={[0.52, 0.2, 0.2]} /><meshStandardMaterial color="#D6A03A" roughness={0.6} metalness={0.2} /></mesh>
            <mesh position={[0, 0.98, 0.02]}><boxGeometry args={[0.5, 0.16, 0.2]} /><meshStandardMaterial color="#D8C79C" roughness={0.8} /></mesh>
          </group>
        );
      })}
      {/* framed paintings */}
      {stage.pics.map((p, i) => <Frame key={i} p={[p.x, p.y, backZ + 0.06]} w={p.w * 1.3} h={p.w} k={p.k} />)}
      {/* wall stains */}
      {stage.stains.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, backZ + 0.02]}><planeGeometry args={[s.s, s.s * 1.3]} /><meshBasicMaterial map={stainTex()} transparent opacity={s.o} depthWrite={false} /></mesh>
      ))}
      {/* floor wear / dirt near walls and under traffic */}
      {stage.wear.map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, 0.012, s.z]}><planeGeometry args={[s.s * 1.8, s.s]} /><meshBasicMaterial map={stainTex()} transparent opacity={s.o} depthWrite={false} /></mesh>
      ))}
      {/* small floor clutter along the back wall */}
      {stage.clutter.map((c, i) => { const C = MAP[c.t]; return <C key={i} position={[c.x, 0, c.z]} rotation={[0, c.ry, 0]} scale={c.s} frame={frame} night={night} />; })}
      {/* warm flicker spill on the back wall (reads as lamp light, ~flicker) */}
      <mesh position={[0, 2.6, backZ + 0.025]}><planeGeometry args={[W, 3]} /><meshBasicMaterial map={stainTex()} color="#FFD9A0" transparent opacity={0.1 * flick} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
};
