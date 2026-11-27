import React from "react";
import * as THREE from "three";
import { bodyMat, featureMat, inkMat, mix } from "../char3d/materials";
import { HR, SurfaceStroke, onSphere, faceQuat } from "../char3d/face";

/**
 * REAL 3D baby: sphere head with sphere eyes, tube smile, pink cheek blobs, a tuft curl, swaddle = egg-shaped lathe with wrap bands,
 * tiny sphere hands peeking out. Breathes and rocks continuously. Scale 1 ~ same unit system as the characters (head sphere r 24).
 */
const UNIT = 2 / 392;
type V3 = [number, number, number];
const SKIN = "#FFF1E0";
const gc = new Map<string, THREE.BufferGeometry>();
const G = (k: string, f: () => THREE.BufferGeometry) => { let g = gc.get(k); if (!g) { g = f(); gc.set(k, g); } return g; };
const SPH = () => G("bsph", () => new THREE.SphereGeometry(1, 36, 26));

const Solid: React.FC<{ geo: THREE.BufferGeometry; color: string; ink?: number; position?: V3; scale?: V3 | number; rotation?: V3 }> = ({ geo, color, ink = 0, position, scale, rotation }) => (
  <group position={position} scale={scale as any} rotation={rotation as any}>
    <mesh geometry={geo} material={bodyMat(color)} castShadow receiveShadow />
    {ink > 0 && <mesh geometry={geo} material={inkMat(ink)} />}
  </group>
);

export const Baby3D: React.FC<{ position: V3; scale?: number; time: number; rock?: number; blink?: boolean; wrap?: string; band?: string; yaw?: number }> = ({ position, scale = 0.8, time, rock = 1, wrap = "#F4E6C8", band = "#C98A4B", yaw = 0 }) => {
  const t = time;
  const s = (scale / 0.8) * UNIT;
  const R = 24, f = R / HR; // face features are authored for the r=56 head: scale them
  const breath = 1 + 0.02 * Math.sin(t * 2.1);
  const rockZ = rock * (0.045 * Math.sin(t * 1.4) + 0.012 * Math.sin(t * 3.7));
  const cyc = Math.floor(t / 2.7), bt = t - cyc * 2.7 - 1.3, closure = bt > 0 && bt < 0.16 ? Math.sin((bt / 0.16) * Math.PI) : 0;
  const eyeOpen = Math.max(0.1, 1 - closure * 0.9);
  const bodyGeo = G("babybody", () => {
    const prof: [number, number][] = [[0, -62], [14, -61], [22, -52], [27, -32], [28, -8], [26, 12], [20, 24], [0, 28]].map(([r, y]) => [r, y] as [number, number]);
    const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36); g.scale(1, 1, 0.82); return g;
  });
  const sm = onSphere(0, -28, 0.4), sw = [-1, 1];
  return (
    <group position={position} scale={s} rotation={[0, yaw, rockZ]}>
      <group scale={[1, breath, 1]}>
        <Solid geo={bodyGeo} color={wrap} ink={2.2} position={[0, 0, 0]} />
        {[-44, -26, -8].map((y, i) => <Solid key={i} geo={G(`tor${i}`, () => new THREE.TorusGeometry(1, 0.07, 10, 40))} color={band} ink={0} position={[0, y, 0]} scale={[24 + (i === 1 ? 5 : i === 2 ? 4 : 0), 24 + (i === 1 ? 5 : i === 2 ? 4 : 0), 24 * 0.82 + 2]} rotation={[Math.PI / 2, 0, 0]} />)}
        {sw.map((sd) => <Solid key={sd} geo={SPH()} color={SKIN} ink={0.2} position={[sd * 15, 17, 20]} scale={5.4} />)}
      </group>
      <group position={[0, 50, 0]} rotation={[0.04 * Math.sin(t * 1.1), 0.1 * Math.sin(t * 0.7) + 0.0, 0.03 * Math.sin(t * 1.6)]}>
        <Solid geo={SPH()} color={SKIN} ink={0.1} scale={R} />
        <group scale={f}>
          {sw.map((sd) => { const p = onSphere(sd * 19, 2, 0.6); return <group key={sd} position={p} quaternion={faceQuat(p)}><mesh geometry={SPH()} material={featureMat()} scale={[4.2, 6.4 * eyeOpen, 2.6]} />{eyeOpen > 0.4 && <mesh geometry={SPH()} position={[1.2, 2.2 * eyeOpen, 1.9]} scale={1.3}><meshBasicMaterial color="#FFFFFF" toneMapped={false} /></mesh>}</group>; })}
          {sw.map((sd) => { const p = onSphere(sd * 31, -12, 0.1); return <mesh key={sd} geometry={SPH()} position={p} quaternion={faceQuat(p)} scale={[8, 5, 1.4]}><meshBasicMaterial color="#F5808E" transparent opacity={0.65} toneMapped={false} /></mesh>; })}
          <SurfaceStroke pts={[[-8, -24], [-4, -27.5], [0, -28.5], [4, -27.5], [8, -24]]} radius={1.8} lift={0.5} mat={featureMat("#231A29", 0.5)} />
        </group>
        <Solid geo={G("babycurl", () => new THREE.TorusGeometry(1, 0.2, 10, 28, Math.PI * 1.5))} color="#6B4426" ink={0} position={[2, R + 1.5, 2]} scale={4.2} rotation={[0.3, 0, 0.5]} />
      </group>
    </group>
  );
};
