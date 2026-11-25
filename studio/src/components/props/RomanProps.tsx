import React from "react";
import * as THREE from "three";
import { Part, Box, Cyl, Sph, lathe, INK } from "./Part";
import { vistaTexture } from "../sets/textures";

type V3 = [number, number, number];
export interface PropBase { position?: V3; rotation?: V3; scale?: number; color?: string; }
const G = (p: PropBase, children: React.ReactNode) => (
  <group position={p.position} rotation={p.rotation} scale={p.scale ?? 1}>{children}</group>
);

/* ---------- ceramics ---------- */
export const Amphora: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#C8643B"} roughness={0.55} geo={lathe([[0.001, 0], [0.12, 0.02], [0.27, 0.28], [0.3, 0.55], [0.22, 0.85], [0.1, 1.05], [0.13, 1.14], [0.001, 1.14]])} />
  <Part color="#8E3F22" position={[-0.2, 0.92, 0]} rotation={[0, 0, 0.3]} geo={<torusGeometry args={[0.13, 0.035, 8, 14, Math.PI]} />} outline={0.05} />
  <Part color="#8E3F22" position={[0.2, 0.92, 0]} rotation={[0, 0, Math.PI - 0.3]} geo={<torusGeometry args={[0.13, 0.035, 8, 14, Math.PI]} />} outline={0.05} />
  <Part color="#F2D6A2" position={[0, 0.62, 0]} geo={Cyl(0.305, 0.305, 0.07, 22)} outline={0.02} />
</>);

export const Jug: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#3E9AA8"} roughness={0.35} geo={lathe([[0.001, 0], [0.1, 0.01], [0.17, 0.14], [0.15, 0.3], [0.07, 0.4], [0.09, 0.46], [0.001, 0.46]])} />
  <Part color="#2A6F7C" position={[0.17, 0.26, 0]} rotation={[0, 0, 0]} geo={<torusGeometry args={[0.08, 0.025, 8, 14, Math.PI * 1.1]} />} outline={0.06} />
</>);

export const Goblet: React.FC<PropBase> = (p) => G(p, <Part color={p.color || "#E7B833"} metalness={0.55} roughness={0.28}
  geo={lathe([[0.001, 0], [0.07, 0.01], [0.02, 0.05], [0.025, 0.14], [0.09, 0.2], [0.1, 0.3], [0.085, 0.3], [0.001, 0.26]])} outline={0.05} />);

export const Bowl: React.FC<PropBase> = (p) => G(p, <Part color={p.color || "#D98E4F"} geo={lathe([[0.001, 0], [0.1, 0.0], [0.22, 0.12], [0.2, 0.12], [0.001, 0.02]])} outline={0.04} />);

export const Platter: React.FC<PropBase & { kind?: "fruit" | "bread" | "mushroom" | "fish" }> = (p) => {
  const k = p.kind || "fruit";
  return G(p, <>
    <Part color="#E9E1CF" geo={Cyl(0.42, 0.34, 0.05, 24)} position={[0, 0.025, 0]} outline={0.04} />
    {k === "fruit" && [[-0.12, 0.1, 0.0, "#D8402E"], [0.1, 0.1, 0.06, "#8CB33E"], [0.0, 0.1, -0.12, "#E8A12D"], [0.2, 0.09, -0.08, "#9B3A68"], [-0.2, 0.09, 0.12, "#D8402E"], [0.02, 0.18, 0.0, "#8CB33E"]].map(([x, y, z, c], i) =>
      <Part key={i} color={c as string} position={[x as number, y as number, z as number]} geo={Sph(0.075, 14, 10)} outline={0.06} />)}
    {k === "bread" && [[-0.15, 0.09, 0.0], [0.12, 0.09, 0.05], [0.0, 0.09, -0.15]].map(([x, y, z], i) =>
      <Part key={i} color="#D79A4B" position={[x, y, z]} scale={[1.3, 0.8, 1]} geo={Sph(0.1, 14, 10)} outline={0.06} />)}
    {k === "mushroom" && [[-0.14, 0.0, 0.05], [0.08, 0.0, -0.05], [0.16, 0.0, 0.1], [-0.02, 0.0, 0.14]].map(([x, , z], i) => (
      <group key={i} position={[x, 0.05, z]}>
        <Part color="#EFE3C8" position={[0, 0.05, 0]} geo={Cyl(0.03, 0.04, 0.1, 10)} outline={0.06} />
        <Part color={i % 2 ? "#B25B35" : "#C97B45"} position={[0, 0.12, 0]} scale={[1, 0.65, 1]} geo={Sph(0.085, 14, 10)} outline={0.06} />
      </group>))}
    {k === "fish" && <Part color="#8FB4C6" position={[0, 0.1, 0]} scale={[1.9, 0.6, 0.9]} geo={Sph(0.1, 14, 10)} outline={0.06} />}
  </>);
};

/* ---------- furniture ---------- */
export const Table: React.FC<PropBase & { w?: number; d?: number; h?: number }> = (p) => {
  const w = p.w ?? 1.6, d = p.d ?? 0.8, h = p.h ?? 0.8;
  const c = p.color || "#A8633A";
  return G(p, <>
    <Part color={c} position={[0, h, 0]} geo={Box([w, 0.1, d])} outline={0.02} />
    <Part color="#7B4527" position={[0, h - 0.1, 0]} geo={Box([w - 0.12, 0.1, d - 0.12])} outline={0.02} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) =>
      <Part key={i} color="#7B4527" position={[sx * (w / 2 - 0.1), h / 2 - 0.02, sz * (d / 2 - 0.1)]} geo={Cyl(0.065, 0.05, h - 0.05, 10)} outline={0.05} />)}
  </>);
};

export const Couch: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#7B4527" position={[0, 0.3, 0]} geo={Box([1.9, 0.2, 0.75])} outline={0.02} />
  <Part color={p.color || "#B03A2E"} position={[0, 0.48, 0.02]} geo={<boxGeometry args={[1.8, 0.2, 0.68]} />} outline={0.03} />
  <Part color="#F2D6A2" position={[-0.7, 0.68, 0]} rotation={[0, 0, 0.3]} geo={Cyl(0.14, 0.14, 0.62, 14)} outline={0.05} />
  <Part color="#8E3F22" position={[0, 0.7, -0.33]} geo={Box([1.9, 0.5, 0.1])} outline={0.03} />
  {[-0.85, 0.85].map((x, i) => [-0.3, 0.3].map((z, j) => <Part key={`${i}${j}`} color="#5E3219" position={[x, 0.1, z]} geo={Cyl(0.06, 0.045, 0.22, 8)} outline={0.05} />))}
</>);

export const Stool: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#A8633A"} position={[0, 0.5, 0]} geo={Cyl(0.24, 0.24, 0.08, 16)} outline={0.04} />
  {[0, 1, 2].map((i) => <Part key={i} color="#6E3E20" position={[Math.cos(i * 2.09) * 0.14, 0.24, Math.sin(i * 2.09) * 0.14]} geo={Cyl(0.035, 0.03, 0.5, 8)} outline={0.06} />)}
</>);

export const Crate: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#B98350"} position={[0, 0.3, 0]} geo={Box([0.6, 0.6, 0.6])} outline={0.03} />
  <Part color="#8B5A33" position={[0, 0.3, 0]} geo={Box([0.64, 0.08, 0.64])} outline={0.02} />
  <Part color="#8B5A33" position={[0, 0.5, 0]} geo={Box([0.64, 0.08, 0.64])} outline={0.02} />
</>);

export const Barrel: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#A56A39"} position={[0, 0.4, 0]} geo={lathe([[0.001, -0.4], [0.28, -0.4], [0.36, 0], [0.28, 0.4], [0.001, 0.4]], 18)} outline={0.03} />
  {[-0.25, 0.25].map((y, i) => <Part key={i} color="#3A3036" position={[0, 0.4 + y, 0]} geo={Cyl(0.335 - Math.abs(y) * 0.2, 0.335 - Math.abs(y) * 0.2, 0.06, 20)} outline={0.02} />)}
</>);

export const Sack: React.FC<PropBase> = (p) => G(p, <>
  <Part color={p.color || "#D8BF8C"} position={[0, 0.25, 0]} scale={[1, 1.15, 0.9]} geo={Sph(0.26, 16, 12)} outline={0.05} />
  <Part color="#9C7F52" position={[0, 0.52, 0]} geo={Cyl(0.08, 0.1, 0.1, 10)} outline={0.06} />
</>);

export const Basket: React.FC<PropBase & { veg?: boolean }> = (p) => G(p, <>
  <Part color="#B58846" position={[0, 0.2, 0]} geo={Cyl(0.3, 0.22, 0.4, 16)} outline={0.04} />
  {p.veg !== false && [[-0.1, 0.0, "#D8602C"], [0.1, 0.02, "#6EA33A"], [0, -0.02, "#C73D2C"], [0.02, 0.1, "#E8B034"]].map(([x, z, c], i) =>
    <Part key={i} color={c as string} position={[x as number, 0.42, z as number]} geo={Sph(0.1, 12, 10)} outline={0.06} />)}
</>);

export const Rug: React.FC<PropBase & { w?: number; d?: number; border?: string }> = (p) => {
  const w = p.w ?? 3, d = p.d ?? 1.6;
  return G(p, <>
    <Part color={p.border || "#2E5F73"} position={[0, 0.012, 0]} geo={Box([w, 0.024, d])} outline={0} shadow={false} />
    <Part color={p.color || "#B8352C"} position={[0, 0.026, 0]} geo={Box([w - 0.3, 0.02, d - 0.3])} outline={0} shadow={false} />
    <Part color="#E9B84A" position={[0, 0.04, 0]} geo={Box([w - 0.6, 0.012, d - 0.6])} outline={0} shadow={false} />
    <Part color={p.color || "#B8352C"} position={[0, 0.046, 0]} geo={Box([w - 0.75, 0.012, d - 0.75])} outline={0} shadow={false} />
  </>);
};

/* ---------- architecture ---------- */
export const Column: React.FC<PropBase & { h?: number; band?: string }> = (p) => {
  const h = p.h ?? 4.2;
  const c = p.color || "#F3E9D2";
  return G(p, <>
    <Part color={c} position={[0, 0.14, 0]} geo={Box([0.84, 0.28, 0.84])} outline={0.015} />
    <Part color={p.band || "#B5452F"} position={[0, 0.7, 0]} geo={Cyl(0.3, 0.33, 0.9, 20)} outline={0.015} />
    <Part color={c} position={[0, 0.28 + (h - 0.7) / 2 + 0.6, 0]} geo={Cyl(0.27, 0.31, h - 1.0, 20)} outline={0.012} />
    <Part color={c} position={[0, h - 0.18, 0]} geo={Box([0.78, 0.22, 0.78])} outline={0.015} />
    <Part color="#E1C38A" position={[0, h - 0.34, 0]} geo={Cyl(0.36, 0.28, 0.16, 20)} outline={0.02} />
  </>);
};

export const Arch: React.FC<PropBase & { w?: number; h?: number; sky?: string; night?: boolean }> = (p) => {
  const w = p.w ?? 2.4, h = p.h ?? 3;
  const vista = React.useMemo(() => vistaTexture(!!p.night), [p.night]);
  return G(p, <>
    <Part color={p.color || "#E8D5B0"} position={[-(w / 2 + 0.2), h / 2, 0]} geo={Box([0.4, h, 0.45])} outline={0.015} />
    <Part color={p.color || "#E8D5B0"} position={[w / 2 + 0.2, h / 2, 0]} geo={Box([0.4, h, 0.45])} outline={0.015} />
    <Part color={p.color || "#E8D5B0"} position={[0, h, 0]} geo={<torusGeometry args={[w / 2 + 0.2, 0.2, 10, 28, Math.PI]} />} outline={0.015} />
    <mesh position={[0, h / 2 + 0.3, -0.2]}>
      <planeGeometry args={[w + 0.4, h + w / 2 + 0.2]} />
      <meshBasicMaterial map={vista} toneMapped={false} />
    </mesh>
  </>);
};

export const Door: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#5E3A24" position={[0, 1.15, 0]} geo={Box([1.3, 2.3, 0.14])} outline={0.02} />
  <Part color="#8A5B38" position={[0, 1.15, 0.05]} geo={Box([1.1, 2.1, 0.08])} outline={0.01} />
  {[0.5, 1.15, 1.8].map((y, i) => <Part key={i} color="#2C2A33" position={[0, y, 0.11]} geo={Box([1.12, 0.06, 0.03])} outline={0} />)}
  {[[-0.35, 0.8], [0.35, 0.8], [-0.35, 1.5], [0.35, 1.5]].map(([x, y], i) => <Part key={i} color="#E7B833" metalness={0.5} position={[x, y, 0.12]} geo={Sph(0.05, 8, 6)} outline={0.05} />)}
</>);

export const Window: React.FC<PropBase & { w?: number; h?: number }> = (p) => {
  const w = p.w ?? 1.1, h = p.h ?? 1.3;
  return G(p, <>
    <Part color="#7B4527" position={[0, 0, 0]} geo={Box([w + 0.3, h + 0.3, 0.12])} outline={0.02} />
    <mesh position={[0, 0, 0.07]}><planeGeometry args={[w, h]} /><meshBasicMaterial color="#FFEFC2" toneMapped={false} /></mesh>
    <Part color="#7B4527" position={[0, 0, 0.09]} geo={Box([0.06, h, 0.05])} outline={0} />
    <Part color="#7B4527" position={[0, 0, 0.09]} geo={Box([w, 0.06, 0.05])} outline={0} />
  </>);
};

export const Banner: React.FC<PropBase & { h?: number }> = (p) => {
  const h = p.h ?? 2.2;
  return G(p, <>
    <Part color="#E7B833" position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geo={Cyl(0.05, 0.05, 0.9, 8)} outline={0.05} />
    <Part color={p.color || "#B03A2E"} position={[0, -h / 2, -0.02]} geo={Box([0.8, h, 0.04])} outline={0.025} />
    <Part color="#E7B833" position={[0, -h / 2 + 0.2, 0.0]} geo={Box([0.5, 0.5, 0.03])} outline={0.05} />
    <Part color={p.color || "#B03A2E"} position={[0, -h / 2 + 0.2, 0.03]} geo={Box([0.3, 0.3, 0.03])} outline={0} />
    <Part color="#E7B833" position={[0, -h - 0.02, 0]} geo={Box([0.8, 0.08, 0.05])} outline={0.04} />
  </>);
};

export const Bust: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#EDE3CF" position={[0, 0.5, 0]} geo={Box([0.5, 1.0, 0.5])} outline={0.02} />
  <Part color="#D6CAB0" position={[0, 1.05, 0]} geo={Box([0.58, 0.1, 0.58])} outline={0.02} />
  <Part color="#F6F0E2" position={[0, 1.45, 0]} scale={[0.85, 1, 0.9]} geo={Sph(0.26, 18, 14)} outline={0.04} />
  <Part color="#F6F0E2" position={[0, 1.2, 0]} geo={Cyl(0.2, 0.28, 0.2, 14)} outline={0.04} />
</>);

/* ---------- light / fire ---------- */
export const Flame: React.FC<{ position?: V3; s?: number; frame?: number }> = ({ position, s = 1, frame = 0 }) => {
  const f = 1 + Math.sin(frame * 0.5 + (position?.[0] ?? 0) * 3) * 0.08;
  return (
    <group position={position} scale={[s, s * f, s]}>
      <mesh><coneGeometry args={[0.1, 0.34, 10]} /><meshBasicMaterial color="#FF9A2E" toneMapped={false} /></mesh>
      <mesh position={[0, -0.04, 0.01]}><coneGeometry args={[0.055, 0.2, 10]} /><meshBasicMaterial color="#FFE08A" toneMapped={false} /></mesh>
      <mesh><sphereGeometry args={[0.24, 12, 10]} /><meshBasicMaterial color="#FFB347" transparent opacity={0.16} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
};

export const Torch: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  <Part color="#3A3036" position={[0, 0, 0]} geo={Box([0.14, 0.5, 0.14])} outline={0.05} />
  <Part color="#6B3F21" position={[0, 0.4, 0.1]} rotation={[0.35, 0, 0]} geo={Cyl(0.06, 0.05, 0.6, 8)} outline={0.06} />
  <Part color="#3A3036" position={[0, 0.7, 0.2]} geo={Cyl(0.11, 0.07, 0.14, 10)} outline={0.05} />
  <Flame position={[0, 0.92, 0.2]} s={1.15} frame={p.frame} />
</>);

export const Brazier: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  {[0, 1, 2].map((i) => <Part key={i} color="#2F2A33" position={[Math.cos(i * 2.09) * 0.25, 0.3, Math.sin(i * 2.09) * 0.25]} rotation={[Math.sin(i * 2.09) * 0.2, 0, -Math.cos(i * 2.09) * 0.2]} geo={Cyl(0.03, 0.03, 0.62, 6)} outline={0.06} />)}
  <Part color="#B9783A" metalness={0.4} roughness={0.4} position={[0, 0.66, 0]} geo={lathe([[0.001, -0.05], [0.2, 0], [0.36, 0.16], [0.3, 0.16], [0.001, 0.04]])} outline={0.04} />
  <mesh position={[0, 0.76, 0]}><sphereGeometry args={[0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color="#FF6B2A" toneMapped={false} /></mesh>
  <Flame position={[0, 0.98, 0]} s={1.35} frame={p.frame} />
</>);

export const OilLamp: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  <Part color="#C98A3C" metalness={0.45} roughness={0.35} scale={[1.4, 0.55, 1]} geo={Sph(0.09, 12, 8)} outline={0.06} />
  <Flame position={[0.12, 0.1, 0]} s={0.38} frame={p.frame} />
</>);

export const HangingLamp: React.FC<PropBase & { drop?: number; frame?: number }> = (p) => {
  const d = p.drop ?? 1.2;
  return G(p, <>
    <Part color="#2F2A33" position={[0, d / 2, 0]} geo={Cyl(0.012, 0.012, d, 5)} outline={0} />
    <Part color="#C98A3C" metalness={0.45} roughness={0.35} geo={lathe([[0.001, -0.1], [0.12, -0.06], [0.26, 0.04], [0.001, 0.04]])} outline={0.05} />
    <Flame position={[0, 0.08, 0]} s={0.7} frame={p.frame} />
  </>);
};

/* ---------- decor / kitchen ---------- */
export const Plant: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#C06A3C" position={[0, 0.25, 0]} geo={Cyl(0.3, 0.2, 0.5, 14)} outline={0.04} />
  {[[0, 0.75, 0, 0.32], [-0.2, 0.62, 0.05, 0.22], [0.2, 0.66, -0.04, 0.24], [0.05, 0.98, 0.08, 0.22], [-0.1, 0.9, -0.1, 0.2]].map(([x, y, z, r], i) =>
    <Part key={i} color={["#4C8F3A", "#5FA245", "#3E7D33", "#6BB04C", "#4C8F3A"][i]} position={[x, y, z]} geo={Sph(r, 12, 10)} outline={0.05} />)}
</>);

export const Shelf: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#7B4527" position={[0, 0, 0]} geo={Box([2.0, 0.08, 0.4])} outline={0.03} />
  {[-0.7, 0, 0.65].map((x, i) => <Amphora key={i} position={[x, 0.04, 0]} scale={0.3 + (i % 2) * 0.08} color={["#C8643B", "#8F9B52", "#D8A04A"][i]} />)}
</>);

export const Cauldron: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  <Part color="#2E2B33" position={[0, 0.5, 0]} geo={lathe([[0.001, -0.35], [0.3, -0.25], [0.45, 0], [0.4, 0.25], [0.46, 0.28], [0.001, 0.28]], 20)} outline={0.03} />
  <mesh position={[0, 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.4, 20]} /><meshBasicMaterial color="#8E6A3C" /></mesh>
  {[-0.28, 0, 0.28].map((x, i) => <Part key={i} color="#5A3A22" position={[x, 0.1, 0]} geo={Cyl(0.06, 0.07, 0.2, 6)} outline={0.06} />)}
  <Flame position={[0, 0.12, 0.25]} s={1.1} frame={p.frame} />
  <Flame position={[0.2, 0.1, -0.1]} s={0.85} frame={(p.frame ?? 0) + 3} />
</>);

export const Oven: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  <Part color="#B9704A" position={[0, 0.8, 0]} geo={Box([2.2, 1.6, 1.2])} outline={0.015} />
  <Part color="#7A3F2B" position={[0, 0.78, 0.55]} geo={Box([1.2, 1.0, 0.2])} outline={0.02} />
  <mesh position={[0, 0.76, 0.67]}><planeGeometry args={[0.9, 0.7]} /><meshBasicMaterial color="#FF8A2A" toneMapped={false} /></mesh>
  <Flame position={[0, 0.58, 0.64]} s={1.5} frame={p.frame} />
  <Part color="#8E4F34" position={[0, 1.72, 0]} geo={Cyl(0.35, 0.5, 0.35, 12)} outline={0.02} />
</>);

export const Hanging: React.FC<PropBase & { kind?: "pot" | "herbs" | "fish" | "garlic" }> = (p) => {
  const k = p.kind || "pot";
  return G(p, <>
    <Part color="#2F2A33" position={[0, 0.3, 0]} geo={Cyl(0.012, 0.012, 0.6, 5)} outline={0} />
    {k === "pot" && <Part color="#7C7480" metalness={0.5} roughness={0.4} position={[0, 0, 0]} geo={Sph(0.17, 14, 10)} outline={0.05} />}
    {k === "herbs" && [0, 1, 2].map((i) => <Part key={i} color={["#5C9A3F", "#7BB04A", "#4C8F3A"][i]} position={[(i - 1) * 0.07, -0.1 - i * 0.02, 0]} scale={[0.5, 1.6, 0.5]} geo={Sph(0.08, 8, 8)} outline={0.06} />)}
    {k === "fish" && [0, 1].map((i) => <Part key={i} color="#9FB7C4" position={[(i - 0.5) * 0.18, -0.15, 0]} scale={[0.4, 1.6, 0.4]} geo={Sph(0.09, 8, 8)} outline={0.06} />)}
    {k === "garlic" && [0, 1, 2, 3].map((i) => <Part key={i} color="#F2EBD6" position={[(i % 2 - 0.5) * 0.14, -0.1 - i * 0.1, 0]} geo={Sph(0.07, 8, 8)} outline={0.07} />)}
  </>);
};

export const Bed: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#8A5B38" position={[0, 0.2, 0]} geo={Box([1.6, 0.25, 0.8])} outline={0.025} />
  <Part color={p.color || "#D6B25E"} position={[0, 0.38, 0]} geo={Box([1.5, 0.15, 0.72])} outline={0.03} />
  <Part color="#F2EBD6" position={[-0.55, 0.5, 0]} scale={[1, 0.6, 1]} geo={Sph(0.26, 12, 10)} outline={0.05} />
</>);

export const Laundry: React.FC<PropBase> = (p) => G(p, <>
  <Part color="#2F2A33" position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geo={Cyl(0.015, 0.015, 2.2, 5)} outline={0} />
  {[[-0.7, "#F0E7D2"], [-0.15, "#C95E4B"], [0.45, "#4E8CA3"]].map(([x, c], i) => (
    <Part key={i} color={c as string} position={[x as number, -0.4, 0]} geo={Box([0.45, 0.8, 0.03])} outline={0.04} />))}
</>);

export const Scroll: React.FC<PropBase> = (p) => G(p, <Part color="#F2E4C0" rotation={[0, 0, Math.PI / 2]} geo={Cyl(0.05, 0.05, 0.4, 10)} outline={0.06} />);

export const Loaf: React.FC<PropBase> = (p) => G(p, <Part color="#D79A4B" scale={[1.3, 0.8, 1]} geo={Sph(0.12, 14, 10)} outline={0.06} />);

export const Chandelier: React.FC<PropBase & { frame?: number }> = (p) => G(p, <>
  <Part color="#2F2A33" position={[0, 0.5, 0]} geo={Cyl(0.015, 0.015, 1, 5)} outline={0} />
  <Part color="#C98A3C" metalness={0.5} roughness={0.35} geo={<torusGeometry args={[0.5, 0.04, 8, 24]} />} rotation={[Math.PI / 2, 0, 0]} outline={0.06} />
  {[0, 1, 2, 3, 4, 5].map((i) => <Flame key={i} position={[Math.cos(i * 1.047) * 0.5, 0.18, Math.sin(i * 1.047) * 0.5]} s={0.55} frame={(p.frame ?? 0) + i} />)}
</>);

export const Cushion: React.FC<PropBase> = (p) => G(p, <Part color={p.color || "#2E8B8B"} scale={[1, 0.45, 1]} geo={Sph(0.2, 12, 10)} outline={0.06} />);

export { INK };
