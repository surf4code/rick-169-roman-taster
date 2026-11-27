import { kfVec3, easeOut, easeInOut, shake, slowMoTime } from "./anim";

export type V3 = [number, number, number];
export interface CamState { pos: V3; look: V3; roll: number; fov: number; }

export interface CustomCam { from: V3; to: V3; look: V3; lookTo?: V3; fov?: number; fovTo?: number; orbit?: number; /* degrees swung around the look point (+ = camera drifts to screen-right) */ }
/** Hand-authored smooth move: position/look/fov eased with one smoothstep over the whole shot (no snaps, no overshoot). */
export function customCamera(c: CustomCam, u: number): CamState {
  const k = u * u * (3 - 2 * u);
  const L = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const look = L(c.look, c.lookTo ?? c.look);
  let pos = L(c.from, c.to);
  if (c.orbit) { // orbit the look point (3D parallax: set pieces slide against each other like a real camera move)
    const a = (c.orbit * Math.PI / 180) * k, dx = pos[0] - look[0], dz = pos[2] - look[2];
    pos = [look[0] + dx * Math.cos(a) + dz * Math.sin(a), pos[1], look[2] - dx * Math.sin(a) + dz * Math.cos(a)];
  }
  return { pos, look, roll: 0, fov: (c.fov ?? 36) + ((c.fovTo ?? c.fov ?? 36) - (c.fov ?? 36)) * k };
}

/** Zack-D-Films style camera vocabulary. Pure function of (mode, time in shot, shot duration). */
export function cameraFor(mode: string, localT: number, dur: number, f: V3 = [0, 0, 0]): CamState {
  const A = (v: V3): V3 => [v[0] + f[0], v[1] + f[1], v[2] + f[2]];
  const u = Math.min(1, Math.max(0, localT / Math.max(dur, 0.1)));
  let pos: V3 = [0, 1.5, 5.2];
  let look: V3 = [0, 1.15, 0];
  let roll = 0;
  let fov = 38;

  switch (mode) {
    case "slow_push":
      pos = kfVec3(u, [[0, [-0.4, 1.55, 6.0]], [1, [0.1, 1.45, 4.7]]]); break;
    case "punch_in":
      pos = kfVec3(u, [[0, [0, 1.5, 4.4]], [0.3, [0, 1.46, 3.0]], [1, [0, 1.44, 2.8]]], easeOut); look = [0, 1.3, 0]; break;
    case "low_angle_tilt":
      pos = kfVec3(u, [[0, [0.3, 0.55, 4.2]], [1, [-0.2, 0.7, 3.4]]]); look = kfVec3(u, [[0, [0, 1.3, 0]], [1, [0, 1.95, -0.4]]]); break;
    case "top_down_drift":
      pos = kfVec3(u, [[0, [-0.6, 6.4, 3.4]], [1, [0.6, 6.0, 2.6]]]); look = [0, 0.4, -0.8]; break;
    case "macro_push":
      pos = kfVec3(u, [[0, [0.35, 1.3, 0.6]], [1, [0.08, 1.12, -0.2]]], easeOut); look = [0, 1.0, -1.7]; fov = 26; break;
    case "slowmo_impact": {
      const te = slowMoTime(localT, 0.6, 2.4, 0.25) / Math.max(dur, 0.1);
      pos = kfVec3(te, [[0, [0.35, 1.3, 0.6]], [1, [0.08, 1.12, -0.2]]], easeOut); look = [0, 1.0, -1.7]; fov = 26;
      const sh = shake(localT, 2.4, 7); pos = [pos[0] + sh[0], pos[1] + sh[1], pos[2] + sh[2]]; break;
    }
    case "whip_right":
      pos = kfVec3(u, [[0, [-3.2, 1.5, 4.4]], [0.22, [0.7, 1.5, 4.0]], [1, [0.9, 1.5, 3.8]]], easeOut);
      look = kfVec3(u, [[0, [-1.8, 1.3, 0]], [0.22, [0.5, 1.3, 0]], [1, [0.5, 1.3, 0]]], easeOut);
      roll = (1 - Math.min(1, u * 5)) * 0.09; break;
    case "fly_through":
      pos = kfVec3(u, [[0, [0, 1.7, 7.4]], [1, [0.2, 1.35, 2.9]]], easeInOut); look = kfVec3(u, [[0, [0, 1.5, -6]], [1, [0, 1.2, -1]]]); break;
    case "corridor_dolly":
      pos = kfVec3(u, [[0, [0, 1.35, 6.2]], [1, [0, 1.3, 3.4]]]); look = [0, 1.25, -4]; break;
    case "orbit":
      pos = [Math.sin(-0.5 + u * 1.0) * 4.4, 1.5, Math.cos(-0.5 + u * 1.0) * 4.4]; look = [0, 1.2, 0]; break;
    case "crane_down":
      pos = kfVec3(u, [[0, [0, 4.8, 5.4]], [1, [0, 1.6, 4.2]]], easeInOut); look = [0, 1.0, 0]; break;
    case "dutch_punch":
      pos = kfVec3(u, [[0, [0.4, 1.35, 4.0]], [1, [0.1, 1.3, 2.7]]], easeOut); look = [0, 1.3, 0]; roll = 0.07; break;
    // --- Rick-style cinematography (all relative to the focus point f; none are static) ---
    case "wide_est":
      pos = A(kfVec3(u, [[0, [-0.9, 1.5, 6.0]], [1, [0.3, 1.38, 4.7]]])); look = A([0, 1.1, 0]); fov = 40; break;
    case "cu_hero":   // head ~45% of frame height, character on the right third
      pos = A(kfVec3(u, [[0, [1.0, 1.46, 2.6]], [1, [0.55, 1.42, 2.0]]], easeOut)); look = A([-0.3, 1.38, 0]); fov = 32; break;
    case "low_hero":  // low-angle hero shot with push-in
      pos = A(kfVec3(u, [[0, [0.8, 0.45, 3.1]], [1, [0.35, 0.62, 2.3]]], easeOut)); look = A(kfVec3(u, [[0, [-0.25, 1.4, 0]], [1, [-0.2, 1.55, 0]]])); fov = 36; break;
    case "ecu_face":  // extreme close-up on the face
      pos = A(kfVec3(u, [[0, [0.5, 1.42, 2.3]], [1, [0.3, 1.4, 1.85]]], easeOut)); look = A([-0.1, 1.36, 0]); fov = 30; break;
    case "insert_macro": // prop insert
      pos = A(kfVec3(u, [[0, [0.3, 0.1, 1.9]], [1, [0.08, 0.04, 1.45]]], easeOut)); look = A([0, 0.05, 0]); roll = 0.025; fov = 30; break;
    // --- Miko-style calm camera: constant fov, tiny travel (<= ~0.9 world units), symmetric ease, never a punch/zoom ---
    case "calm_wide":   // wide establishing, gentle lateral glide
      pos = A(kfVec3(u, [[0, [-0.55, 1.55, 6.1]], [1, [0.55, 1.5, 5.8]]])); look = A([0, 1.15, 0]); fov = 40; break;
    case "calm_mid":    // medium shot, slow glide to the right
      pos = A(kfVec3(u, [[0, [-0.45, 1.42, 3.9]], [1, [0.45, 1.4, 3.75]]])); look = A([0, 1.22, 0]); fov = 36; break;
    case "calm_mid_l":  // medium shot, slow glide to the left
      pos = A(kfVec3(u, [[0, [0.45, 1.42, 3.9]], [1, [-0.45, 1.4, 3.75]]])); look = A([0, 1.22, 0]); fov = 36; break;
    case "calm_close":  // chest-up, almost still, 6% drift
      pos = A(kfVec3(u, [[0, [0.3, 1.36, 3.7]], [1, [-0.1, 1.34, 3.55]]])); look = A([0, 1.25, 0]); fov = 34; break;
    case "calm_low":    // low-angle hold, slow rise
      pos = A(kfVec3(u, [[0, [0.5, 0.75, 4.3]], [1, [0.2, 0.95, 4.1]]])); look = A([0, 1.45, 0]); fov = 37; break;
    default: break;
  }
  return { pos, look, roll, fov };
}
