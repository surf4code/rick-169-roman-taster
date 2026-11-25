import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { mulberry32 } from "../utils/anim";

let shaftTex: THREE.CanvasTexture | null = null;
function getShaftTexture() {
  if (shaftTex) return shaftTex;
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 256;
  const c = cv.getContext("2d")!;
  const gx = c.createLinearGradient(0, 0, 128, 0);
  gx.addColorStop(0, "rgba(255,255,255,0)"); gx.addColorStop(0.5, "rgba(255,255,255,1)"); gx.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gx; c.fillRect(0, 0, 128, 256);
  c.globalCompositeOperation = "destination-in";
  const gy = c.createLinearGradient(0, 0, 0, 256);
  gy.addColorStop(0, "rgba(0,0,0,1)"); gy.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = gy; c.fillRect(0, 0, 128, 256);
  shaftTex = new THREE.CanvasTexture(cv);
  return shaftTex;
}

/** Soft light shafts (feathered additive planes) + tiny drifting dust motes. */
export const AtmosphereFX: React.FC<{ count?: number; seed?: number; warmTorch?: boolean }> = ({ count = 40, seed = 9001, warmTorch = false }) => {
  const frame = useCurrentFrame();
  const tex = useMemo(() => getShaftTexture(), []);
  const particles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 9.0, y: rng() * 4.2 + 0.3, z: (rng() - 0.5) * 5.0,
      speedY: 0.002 + rng() * 0.003, phase: rng() * Math.PI * 2, size: 0.008 + rng() * 0.012,
    }));
  }, [count, seed]);
  const col = warmTorch ? "#FFC27A" : "#FFF0BE";
  return (
    <group>
      {[[-3.2, 3.2, -1.8, 0.45, 2.4, 7], [-1.2, 3.4, -2.6, 0.5, 1.6, 7.5], [2.6, 3.3, -2.2, 0.42, 1.9, 7]].map(([x, y, z, rz, w, h], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0.25, rz]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} color={col} transparent opacity={warmTorch ? 0.16 : 0.2} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      {particles.map((p, i) => {
        const y = ((p.y + frame * p.speedY) % 4.2) + 0.2;
        const x = p.x + Math.sin(frame * 0.03 + p.phase) * 0.14;
        return (
          <mesh key={i} position={[x, y, p.z]}>
            <sphereGeometry args={[p.size, 6, 6]} />
            <meshBasicMaterial color="#FFFBEB" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};
