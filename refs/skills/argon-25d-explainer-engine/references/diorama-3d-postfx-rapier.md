# 2.5D Diorama Environments, Post-Processing, God Rays, Glow Counters & Rapier Physics

This reference provides the 3D scene layers from `What If You Could See Everyone's Body Count - Miko`, integrating `@react-three/fiber`, `@react-three/postprocessing`, `@react-three/rapier`, and `pixelfx`-inspired deterministic particle systems.

---

## 1. `src/components/FloatingCounter3D.tsx` (Glowing Numbers & Badges Above Heads)

Recreates the signature glowing numbers and icons floating above characters' heads in the Miko video. Uses `toneMapped={false}` and high emissive color so `@react-three/postprocessing` `Bloom` wraps the number in a soft neon halo.

```tsx
import React from "react";
import { Text, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

export interface FloatingCounter3DProps {
  value: number | string;
  position: [number, number, number];
  appearFrame: number;
  accentColor?: string;
}

export const FloatingCounter3D: React.FC<FloatingCounter3DProps> = ({
  value,
  position,
  appearFrame,
  accentColor = "#38BDF8",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popScale = spring({
    frame: Math.max(0, frame - appearFrame),
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.7 },
  });

  if (frame < appearFrame) return null;

  const hoverY = Math.sin(frame * 0.08) * 0.06;

  return (
    <group
      position={[position[0], position[1] + hoverY, position[2]]}
      scale={[popScale, popScale, popScale]}
    >
      {/* Backing Pill with Dark Outline */}
      <RoundedBox args={[1.15, 0.56, 0.08]} radius={0.16} smoothness={4}>
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.1} />
      </RoundedBox>

      {/* Emissive Rim Border (Triggers Selective Bloom) */}
      <RoundedBox args={[1.21, 0.62, 0.04]} radius={0.18} smoothness={4} position={[0, 0, -0.03]}>
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </RoundedBox>

      {/* Crisp Number Text */}
      <Text
        position={[0, 0.01, 0.06]}
        fontSize={0.34}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#090D16"
      >
        {String(value)}
      </Text>
    </group>
  );
};
```

---

## 2. `src/components/AtmosphereFX.tsx` (Volumetric God Rays + Deterministic Dust Motes)

Adds diagonal sunlight shafts through windows and slow-drifting 3D dust motes driven deterministically by `mulberry32(seed)`.

```tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { mulberry32 } from "../utils/cinema";

export const AtmosphereFX: React.FC<{ count?: number; seed?: number }> = ({
  count = 55,
  seed = 9001,
}) => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 9.0,
      y: rng() * 4.2 + 0.3,
      z: (rng() - 0.5) * 6.0,
      speedY: 0.003 + rng() * 0.005,
      phase: rng() * Math.PI * 2,
      size: 0.025 + rng() * 0.035,
    }));
  }, [count, seed]);

  return (
    <group>
      {/* Volumetric Diagonal Window Light Shafts */}
      <mesh position={[-2.2, 2.6, -1.8]} rotation={[0, 0, -0.42]}>
        <coneGeometry args={[1.8, 6.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#FEF08A"
          transparent
          opacity={0.085}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Deterministic Drifting Dust Motes */}
      {particles.map((p, i) => {
        const y = ((p.y + frame * p.speedY) % 4.2) + 0.2;
        const x = p.x + Math.sin(frame * 0.03 + p.phase) * 0.14;
        return (
          <mesh key={i} position={[x, y, p.z]}>
            <sphereGeometry args={[p.size, 8, 8]} />
            <meshBasicMaterial
              color="#FFFBEB"
              transparent
              opacity={0.55}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
```

---

## 3. `src/components/DioramaStage.tsx` (Parameterized 2.5D Room & Environment Builder)

Builds layered 3D diorama environments (`apartment_courtyard`, `kitchen_morning`, `city_bus_interior`, `lecture_hall`, `street_crosswalk`, `minimal_data_void`) with foreground bokeh-blur props, mid-ground stage floor, and background architectural walls.

```tsx
import React from "react";
import { RoundedBox } from "@react-three/drei";

export type EnvironmentPreset =
  | "apartment_courtyard"
  | "kitchen_morning"
  | "city_bus_interior"
  | "lecture_hall"
  | "street_crosswalk"
  | "minimal_data_void";

const PALETTES: Record<
  EnvironmentPreset,
  { wall: string; floor: string; accent: string; keyLight: string; rimLight: string }
> = {
  apartment_courtyard: {
    wall: "#1E293B", floor: "#334155", accent: "#F59E0B", keyLight: "#FFFBEB", rimLight: "#38BDF8"
  },
  kitchen_morning: {
    wall: "#F1F5F9", floor: "#CBD5E1", accent: "#FB923C", keyLight: "#FEF3C7", rimLight: "#60A5FA"
  },
  city_bus_interior: {
    wall: "#0F172A", floor: "#1E293B", accent: "#2DD4BF", keyLight: "#E0F2FE", rimLight: "#F472B6"
  },
  lecture_hall: {
    wall: "#27272A", floor: "#3F3F46", accent: "#A78BFA", keyLight: "#FEF9C3", rimLight: "#38BDF8"
  },
  street_crosswalk: {
    wall: "#18181B", floor: "#27272A", accent: "#FACC15", keyLight: "#FFEDD5", rimLight: "#818CF8"
  },
  minimal_data_void: {
    wall: "#090D16", floor: "#111827", accent: "#38BDF8", keyLight: "#F8FAFC", rimLight: "#22D3EE"
  },
};

export const DioramaStage: React.FC<{ preset: EnvironmentPreset }> = ({ preset }) => {
  const pal = PALETTES[preset] || PALETTES.apartment_courtyard;

  return (
    <group>
      {/* 3-Point Cinema Lighting */}
      <ambientLight intensity={0.45} />
      <hemisphereLight args={[pal.keyLight, pal.floor, 0.55]} />
      <directionalLight
        position={[4.5, 6.5, 4.0]}
        intensity={1.65}
        color={pal.keyLight}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4.5, 3.5, -2.5]} intensity={1.1} color={pal.rimLight} />

      {/* Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color={pal.floor} roughness={0.85} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 3.5, -3.6]} receiveShadow>
        <boxGeometry args={[16, 7.5, 0.3]} />
        <meshStandardMaterial color={pal.wall} roughness={0.75} />
      </mesh>

      {/* Glowing Window / Architectural Accent */}
      <RoundedBox args={[2.4, 2.8, 0.12]} position={[-2.4, 3.1, -3.4]} radius={0.08}>
        <meshStandardMaterial
          color={pal.accent}
          emissive={pal.accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </RoundedBox>

      {/* Mid-ground Counter / Desk / Bus Seat Prop */}
      <RoundedBox args={[2.8, 0.95, 0.9]} position={[1.8, 0.48, -1.2]} radius={0.08} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </RoundedBox>

      {/* Foreground Silhouette Framing Props (Blurred by DepthOfField) */}
      <RoundedBox args={[0.7, 1.8, 0.7]} position={[-2.6, 0.9, 2.3]} radius={0.1}>
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </RoundedBox>
    </group>
  );
};
```

---

## 4. `src/components/PostFX.tsx` (Tuned Bokeh Blur, Selective Bloom & Vignette)

```tsx
import React from "react";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";

export const PostFX: React.FC<{ focusDistance: number; bokehScale: number }> = ({
  focusDistance,
  bokehScale,
}) => {
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        focusDistance={focusDistance}
        focalLength={0.025}
        bokehScale={bokehScale}
        height={360}
      />
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.88}
        intensity={1.2}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.14} darkness={0.48} />
    </EffectComposer>
  );
};
```
