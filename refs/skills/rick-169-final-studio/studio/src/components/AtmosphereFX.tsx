import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { mulberry32 } from "../utils/anim";

export const AtmosphereFX: React.FC<{ count?: number; seed?: number; warmTorch?: boolean }> = ({
  count = 45,
  seed = 9001,
  warmTorch = false,
}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 9.0,
      y: rng() * 4.2 + 0.3,
      z: (rng() - 0.5) * 5.0,
      speedY: 0.003 + rng() * 0.004,
      phase: rng() * Math.PI * 2,
      size: 0.022 + rng() * 0.028,
    }));
  }, [count, seed]);

  return (
    <group>
      <mesh position={[-2.4, 2.8, -1.8]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[1.7, 6.4, 16, 1, true]} />
        <meshBasicMaterial
          color={warmTorch ? "#FFCA7A" : "#FFF1C1"}
          transparent
          opacity={warmTorch ? 0.095 : 0.075}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {particles.map((p, i) => {
        const y = ((p.y + frame * p.speedY) % 4.2) + 0.2;
        const x = p.x + Math.sin(frame * 0.03 + p.phase) * 0.14;
        return (
          <mesh key={i} position={[x, y, p.z]}>
            <sphereGeometry args={[p.size, 8, 8]} />
            <meshBasicMaterial color="#FFFBEB" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};
