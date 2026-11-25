import React from "react";
import * as THREE from "three";

export const INK = "#1B1520";
type V3 = [number, number, number];

export interface PartProps {
  geo: React.ReactNode;
  color: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  outline?: number; // inverted-hull ink outline thickness (0 = none)
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shadow?: boolean;
}

/** One solid piece with a hand-inked look: soft-lit body + inverted-hull black outline. */
export const Part: React.FC<PartProps> = ({
  geo, color, position, rotation, scale, outline = 0.02, roughness = 0.72, metalness = 0,
  emissive, emissiveIntensity = 0, shadow = true,
}) => (
  <group position={position} rotation={rotation} scale={scale as any}>
    <mesh castShadow={shadow} receiveShadow>
      {geo}
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} emissive={emissive || "#000000"} emissiveIntensity={emissiveIntensity} />
    </mesh>
    {outline > 0 && (
      <mesh scale={1 + outline}>
        {geo}
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
    )}
  </group>
);

export const Box = (a: [number, number, number]) => <boxGeometry args={a} />;
export const Cyl = (rt: number, rb: number, h: number, seg = 20) => <cylinderGeometry args={[rt, rb, h, seg]} />;
export const Sph = (r: number, ws = 20, hs = 14) => <sphereGeometry args={[r, ws, hs]} />;
export const lathe = (pts: [number, number][], seg = 24) => (
  <latheGeometry args={[pts.map(([x, y]) => new THREE.Vector2(x, y)), seg]} />
);
