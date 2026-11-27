import React from "react";
import * as THREE from "three";
import { bodyMat, inkMat, mix } from "./materials";
import { HR, SurfaceStroke, onSphere, faceQuat } from "./face";
import { featureMat } from "./materials";

type V3 = [number, number, number];
const gc = new Map<string, THREE.BufferGeometry>();
const G = (k: string, f: () => THREE.BufferGeometry) => { let g = gc.get(k); if (!g) { g = f(); gc.set(k, g); } return g; };
const SPH = () => G("hsph", () => new THREE.SphereGeometry(1, 28, 20));

/** open sphere shell (hair cap) — thetaLen measured from the crown */
const cap = (r: number, thetaLen: number, phiStart = 0, phiLen = Math.PI * 2) => G(`cap${r}|${thetaLen}|${phiStart}|${phiLen}`, () => new THREE.SphereGeometry(r, 44, 26, phiStart, phiLen, 0, thetaLen));

const Part: React.FC<{ geo: THREE.BufferGeometry; color: string; ink?: number; position?: V3; scale?: V3 | number; rotation?: V3; metal?: boolean }> = ({ geo, color, ink = 2, position, scale, rotation, metal }) => (
  <group position={position} scale={scale as any} rotation={rotation as any}>
    <mesh geometry={geo} material={bodyMat(color, metal ? { metalness: 0.35, roughness: 0.45 } : {})} castShadow />
    {ink > 0 && <mesh geometry={geo} material={inkMat(ink)} />}
  </group>
);
const Ball: React.FC<{ p: V3; r: number | V3; color: string; ink?: number }> = ({ p, r, color, ink = 1.8 }) => {
  const rr = typeof r === "number" ? r : Math.max(...r);
  return <Part geo={SPH()} color={color} ink={ink / rr} position={p} scale={r} />;
};

export const Hair3D: React.FC<{ style: string; color: string; accent: string; t: number; ph: number }> = ({ style, color, accent, t, ph }) => {
  const R = HR + 2.6;
  const bob = Math.sin(t * 1.3 + ph) * 0.8;
  const dark = mix(color, "#000000", 0.25);
  switch (style) {
    case "curl": // protagonist: neat cap + spiral curl on top
      return (<group>
        <Part geo={cap(R, 1.12)} color={color} ink={2} />
        <Part geo={G("curlT", () => new THREE.TorusGeometry(8, 2.6, 12, 30, Math.PI * 1.6))} color={color} ink={1} position={[2, R + 4 + bob * 0.3, 2]} rotation={[0.3, 0, 0.6]} />
      </group>);
    case "tied_bun":
      return (<group>
        <Part geo={cap(R, 1.2)} color={color} ink={2} />
        <Part geo={G("band", () => new THREE.TorusGeometry(56, 3.4, 12, 60))} color={accent} ink={0.9} position={[0, 17, 0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} metal />
        <Ball p={[0, 60 + bob * 0.5, -16]} r={17} color={color} />
        <Ball p={[0, 52, -12]} r={6} color={dark} ink={0} />
      </group>);
    case "side_buns":
      return (<group>
        <Part geo={cap(R, 1.2)} color={color} ink={2} />
        <Ball p={[-52, 20 + bob * 0.4, -6]} r={14} color={color} />
        <Ball p={[52, 20 - bob * 0.4, -6]} r={14} color={color} />
        <Part geo={G("dia", () => new THREE.TorusGeometry(53, 2.6, 10, 60, Math.PI))} color="#D6A64E" ink={0.8} position={[0, 28, 0]} rotation={[0.35, 0, 0]} metal />
        <Ball p={[0, 52, 28]} r={4} color="#C41E3A" ink={0} />
      </group>);
    case "crop":
      return (<group><Part geo={cap(R, 1.04)} color={color} ink={2} /><Part geo={cap(R + 0.6, 1.5, Math.PI * 0.62, Math.PI * 0.76)} color={color} ink={1.6} position={[0, -1, -2]} /></group>);
    case "boy_cut":
      return (<group><Part geo={cap(R, 1.14)} color={color} ink={2} /><Ball p={[-26, 34, 40]} r={[17, 8, 8]} color={color} /><Ball p={[10, 36, 44]} r={[18, 8, 8]} color={color} /></group>);
    case "curly_laurel": {
      const curls: V3[] = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; curls.push([Math.sin(a) * 44, 32 + Math.cos(a * 2) * 2, Math.cos(a) * 44]); }
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; curls.push([Math.sin(a) * 26, 52, Math.cos(a) * 24]); }
      curls.push([0, 60, 0]);
      const leaves: V3[] = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; leaves.push([Math.sin(a), 0, Math.cos(a)]); }
      return (<group>
        <Part geo={cap(R, 1.0)} color={color} ink={2} />
        {curls.map((p, i) => <Ball key={i} p={p} r={10.5} color={color} ink={1.6} />)}
        <Part geo={G("laur", () => new THREE.TorusGeometry(53, 1.8, 8, 60))} color="#4E7D2E" ink={0} position={[0, 26, 0]} rotation={[Math.PI / 2, 0, 0]} />
        {leaves.map((u, i) => <Part key={`l${i}`} geo={SPH()} color="#6BA83F" ink={0.12} position={[u[0] * 54, 26, u[2] * 54]} scale={[7, 2.4, 3.5]} rotation={[0, Math.atan2(u[0], u[2]) + Math.PI / 2, 0.4]} />)}
      </group>);
    }
    case "wispy":
      return (<group><Part geo={cap(R, 0.85)} color={color} ink={1.6} /><Ball p={[-54, 10, 0]} r={11} color={color} /><Ball p={[54, 10, 0]} r={11} color={color} /><Ball p={[0, 56, 4]} r={9} color={color} ink={1.4} /></group>);
    case "ring_stubble":
    case "bald_ring":
      return (<group><Ball p={[-54, 6, -2]} r={style === "ring_stubble" ? 11 : 9} color={color} /><Ball p={[54, 6, -2]} r={style === "ring_stubble" ? 11 : 9} color={color} /><Ball p={[0, 4, -52]} r={14} color={color} /></group>);
    case "spiky_anime": {
      const sp: { a: number; h: number; y: number }[] = [];
      for (let i = 0; i < 9; i++) sp.push({ a: (i / 9) * Math.PI * 2, h: 22 + (i % 3) * 7, y: 38 });
      return (<group><Part geo={cap(R, 1.05)} color={color} ink={2} />
        {sp.map((s, i) => <Part key={i} geo={G("cone", () => new THREE.ConeGeometry(9, 1, 10))} color={color} ink={0.5} position={[Math.sin(s.a) * 34, s.y + 14, Math.cos(s.a) * 30]} scale={[1, s.h, 1]} rotation={[Math.cos(s.a) * 0.6, 0, -Math.sin(s.a) * 0.6]} />)}
      </group>);
    }
    case "hood":
      return (<group><Part geo={cap(HR + 9, 2.65, Math.PI / 2 + 0.8, Math.PI * 2 - 1.6)} color={color} ink={2.4} /></group>);
    case "cook_cap":
      return (<group>
        <Part geo={G("ccyl", () => new THREE.CylinderGeometry(1, 1, 1, 36))} color="#FAFAF5" ink={0.04} position={[0, 40, 0]} scale={[48, 14, 48]} />
        <Ball p={[0, 62, 0]} r={[34, 24, 34]} color="#FAFAF5" ink={1.6} />
      </group>);
    case "helmet_crest":
      return (<group>
        <Part geo={cap(R + 3, 1.38)} color="#D6A64E" ink={2.2} metal />
        <Ball p={[-50, -4, 4]} r={[8, 20, 16]} color="#C29538" ink={1.4} /><Ball p={[50, -4, 4]} r={[8, 20, 16]} color="#C29538" ink={1.4} />
        <Part geo={G("plume", () => new THREE.ConeGeometry(14, 1, 14))} color="#D41C24" ink={0.5} position={[0, 78, 0]} scale={[1, 40, 1]} />
      </group>);
    default:
      return (<group><Part geo={cap(R, 1.08)} color={color} ink={2} /></group>);
  }
};

export const Facial3D: React.FC<{ kind?: string | null; color: string }> = ({ kind, color }) => {
  if (!kind || kind === "none") return null;
  const dark = mix(color, "#000000", 0.3);
  if (kind === "mustache") {
    return (<group>{[-1, 1].map((s) => { const p = onSphere(s * 8, -15, 1.2); return <group key={s} position={p} quaternion={faceQuat(p)}><Part geo={SPH()} color={dark} ink={0.12} scale={[9, 3.6, 3]} rotation={[0, 0, s * -0.25]} /></group>; })}</group>);
  }
  if (kind === "goatee") { const p = onSphere(0, -44, 1); return <group position={p} quaternion={faceQuat(p)}><Part geo={SPH()} color={dark} ink={0.2} scale={[7, 8, 3]} /></group>; }
  if (kind === "eyebags") {
    return (<group>{[-1, 1].map((s) => <SurfaceStroke key={s} pts={[[s * 24, -8], [s * 19, -10.5], [s * 14, -8.5]]} radius={1.1} lift={0.3} mat={featureMat("#B89AA8", 0.6)} />)}</group>);
  }
  if (kind === "stubble") {
    return (<group>{[-1, 0, 1].map((s) => { const p = onSphere(s * 16, -33, 0.6); return <group key={s} position={p} quaternion={faceQuat(p)}><mesh geometry={SPH()} scale={[9, 4, 1]} material={bodyMat("#D9D0D5", { rim: 0 })} /></group>; })}</group>);
  }
  return null;
};
