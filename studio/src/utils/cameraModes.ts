import { kfVec3, easeOut, easeInOut, shake, slowMoTime } from "./anim";

export type V3 = [number, number, number];
export interface CamState { pos: V3; look: V3; roll: number; fov: number; }

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
    default: break;
  }
  return { pos, look, roll, fov };
}
