import React from "react";
import { Text, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

export const FloatingRoleTag: React.FC<{
  label: string;
  position: [number, number, number];
  appearFrame: number;
  accentColor?: string;
}> = ({ label, position, appearFrame, accentColor = "#2563EB" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < appearFrame) return null;
  const pop = spring({ frame: Math.max(0, frame - appearFrame), fps, config: { damping: 12, stiffness: 170 } });
  const hoverY = Math.sin(frame * 0.09) * 0.05;
  const w = Math.max(1.3, label.length * 0.14 + 0.5);

  return (
    <group position={[position[0], position[1] + hoverY, position[2]]} scale={[pop, pop, pop]}>
      <RoundedBox args={[w, 0.44, 0.06]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color="#FFFBF2" roughness={0.35} />
      </RoundedBox>
      <RoundedBox args={[w + 0.08, 0.50, 0.03]} radius={0.16} smoothness={4} position={[0, 0, -0.025]}>
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
      </RoundedBox>
      <Text position={[0, 0, 0.045]} fontSize={0.21} color="#141414" anchorX="center" anchorY="middle" fontWeight={700}>
        {label}
      </Text>
    </group>
  );
};
