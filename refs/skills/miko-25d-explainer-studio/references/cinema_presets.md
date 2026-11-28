# Cinema Camera, Lip-Sync & Post-Processing Reference

Drop this module into `src/utils/cinema.ts` inside the generated Remotion + Three.js project so every scene uses deterministic PRNG, smooth 2.5D camera grammars, automatic 16:9 / 9:16 framing adjustment, and RMS-driven mouth lip-sync states.

```typescript
// src/utils/cinema.ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export type CameraGrammar =
  | "wide_establishing_dolly"
  | "medium_twoshot_orbit"
  | "closeup_rack_focus"
  | "ots_depth_shot"
  | "isometric_data_reveal";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  focusDistance: number;
  bokehScale: number;
}

export function getCameraPose(
  grammar: CameraGrammar,
  progress: number, // 0..1 across current shot
  isVertical: boolean
): CameraPose {
  const e = smoothstep(0, 1, progress);
  const zScale = isVertical ? 1.38 : 1.0;

  switch (grammar) {
    case "wide_establishing_dolly":
      return {
        position: [0, 1.8, (8.2 - e * 1.4) * zScale],
        target: [0, 1.2, 0],
        focusDistance: 0.035,
        bokehScale: 1.8,
      };
    case "medium_twoshot_orbit": {
      const angle = -0.18 + e * 0.36;
      const radius = 5.4 * zScale;
      return {
        position: [Math.sin(angle) * radius, 1.55, Math.cos(angle) * radius],
        target: [0, 1.35, 0],
        focusDistance: 0.024,
        bokehScale: 2.3,
      };
    }
    case "closeup_rack_focus":
      return {
        position: [-0.6 + e * 0.25, 1.52, (3.3 - e * 0.45) * zScale],
        target: [-0.45, 1.45, 0.4],
        focusDistance: 0.015,
        bokehScale: 3.1,
      };
    case "ots_depth_shot":
      return {
        position: [1.35 - e * 0.2, 1.55, (4.1 - e * 0.3) * zScale],
        target: [-0.35, 1.38, -0.4],
        focusDistance: 0.022,
        bokehScale: 2.7,
      };
    case "isometric_data_reveal":
      return {
        position: [2.6 - e * 0.8, 3.1 - e * 0.4, (6.4 - e * 0.6) * zScale],
        target: [0, 1.6, 0],
        focusDistance: 0.03,
        bokehScale: 2.0,
      };
  }
}

export function getMouthState(rmsValue: number): "closed" | "mid" | "open" {
  if (rmsValue < 0.14) return "closed";
  if (rmsValue < 0.45) return "mid";
  return "open";
}
```

## Post-Processing & Cutout Character Setup

```tsx
// Recommended EffectComposer inside <ThreeCanvas>
<EffectComposer multisampling={0}>
  <DepthOfField
    focusDistance={pose.focusDistance}
    focalLength={0.025}
    bokehScale={pose.bokehScale}
    height={360}
  />
  <Bloom
    luminanceThreshold={0.85}
    luminanceSmoothing={0.9}
    intensity={1.15}
    mipmapBlur
  />
  <Vignette eskil={false} offset={0.15} darkness={0.45} />
</EffectComposer>
```
