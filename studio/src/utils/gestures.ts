import { EmotionName } from "./emotions";

/**
 * Body language per emotion. Wrist targets are relative to each shoulder in svg units:
 * x = OUTWARD from the body centre (negative = across the body), y = DOWN. `pole` is the direction the elbow points.
 * The IK solver turns these into real elbow bends, so the upper arm moves less than the hand (human arm).
 */
export interface Gesture {
  R: [number, number]; L: [number, number];
  poleR: [number, number]; poleL: [number, number];
  shrug: number;        // shoulders lifted (svg units)
  headDown: number;     // head sinks into the shoulders (svg units)
  browLiftL: number; browLiftR: number; // eyebrow raise (svg units)
  fidget: number;       // 0..1 hand fidget (wringing / rubbing) amount
}

const out: [number, number] = [1, 0.35];  // elbow out + slightly down (default)
const down: [number, number] = [0.25, 1];
const up: [number, number] = [0.6, -0.8];

const G = (p: Partial<Gesture>): Gesture => ({
  R: [26, 70], L: [24, 74], poleR: out, poleL: out, shrug: 0, headDown: 0, browLiftL: 0, browLiftR: 0, fidget: 0, ...p,
});

export const GESTURES: Record<EmotionName, Gesture> = {
  neutral: G({}),
  curious: G({ R: [46, 34], L: [22, 74], poleR: [0.7, 0.8], browLiftL: 3, browLiftR: 6 }),
  talking_animated: G({ R: [58, 22], L: [34, 54], poleR: down, poleL: down, browLiftL: 2, browLiftR: 2 }),
  shocked: G({ R: [12, -6], L: [12, -4], poleR: [1, 0.5], poleL: [1, 0.5], browLiftL: 8, browLiftR: 8, headDown: 2 }),
  skeptical: G({ R: [-36, 30], L: [-34, 42], poleR: down, poleL: down, browLiftL: 7, browLiftR: 0 }), // arms crossed, one brow up
  happy_relief: G({ R: [-26, 46], L: [-26, 50], poleR: [0.9, 0.6], poleL: [0.9, 0.6], browLiftL: 2, browLiftR: 2 }),
  nervous_sweat: G({ R: [-20, 72], L: [-22, 74], poleR: [0.9, 0.5], poleL: [0.9, 0.5], browLiftL: 3, browLiftR: 5, fidget: 1, shrug: 3 }),
  focused_reading: G({ R: [-4, 62], L: [-6, 64], poleR: [0.9, 0.6], poleL: [0.9, 0.6], browLiftL: 0, browLiftR: 0 }),
  confident_point: G({ R: [86, -4], L: [38, 68], poleR: [0.4, 1], poleL: [1, 0.1], browLiftL: 2, browLiftR: 2 }),
  embarrassed_blush: G({ R: [8, -62], L: [24, 76], poleR: up, poleL: out, shrug: 4, headDown: 2, browLiftL: 4, browLiftR: 4 }),
  sad_slump: G({ R: [14, 84], L: [12, 86], poleR: down, poleL: down, shrug: -6, headDown: -3 }),
  angry_glare: G({ R: [30, 74], L: [30, 76], poleR: [1, 0.2], poleL: [1, 0.2], shrug: 3 }),
  thinking_chin: G({ R: [-30, -14], L: [-32, 54], poleR: [0.5, 1], poleL: [0.8, 0.8], browLiftL: 6, browLiftR: 0 }),
  surprised_jump: G({ R: [52, -34], L: [52, -30], poleR: [1, 0.3], poleL: [1, 0.3], browLiftL: 9, browLiftR: 9, shrug: 5 }),
  // "I don't know": shoulders up, elbows tucked and bent, palms out, eyebrows up, head sunk a little
  shrug_question: G({ R: [58, 30], L: [58, 32], poleR: down, poleL: down, shrug: 12, headDown: 4, browLiftL: 7, browLiftR: 7 }),
  celebrate_arms_up: G({ R: [38, -88], L: [38, -88], poleR: [1, 0.2], poleL: [1, 0.2], browLiftL: 4, browLiftR: 4 }),
};

const lerp = (a: number, b: number, w: number) => a + (b - a) * w;
const lerp2 = (a: [number, number], b: [number, number], w: number): [number, number] => [lerp(a[0], b[0], w), lerp(a[1], b[1], w)];

export function blendGesture(a: Gesture, b: Gesture, w: number): Gesture {
  return {
    R: lerp2(a.R, b.R, w), L: lerp2(a.L, b.L, w), poleR: lerp2(a.poleR, b.poleR, w), poleL: lerp2(a.poleL, b.poleL, w),
    shrug: lerp(a.shrug, b.shrug, w), headDown: lerp(a.headDown, b.headDown, w),
    browLiftL: lerp(a.browLiftL, b.browLiftL, w), browLiftR: lerp(a.browLiftR, b.browLiftR, w), fidget: lerp(a.fidget, b.fidget, w),
  };
}

/** easeOutBack-ish: reaches the pose with a small overshoot (the "hit" of a shrug / gesture). */
export const hitEase = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  const c1 = 1.1, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
