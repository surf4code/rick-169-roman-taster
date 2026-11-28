// One camera per shot, as pure data. The SAME Cam drives the 3D canvas
// (CameraRig3D) and the 2D cast projection (CastLayer), so the cast cannot
// drift from the world. Modes are ported 1:1 from the Task A CameraRig.
import { kfVec3, easeOut, shake, slowMoTime } from "./anim";
import type { Cam, V3 } from "./camera";

export const shotFov = (shotType: string) => (shotType === "macro_prop_insert" ? 26 : 38);

export function shotCamera(cameraMode: string, localT: number, dur: number, fov: number): Cam {
  const u = Math.min(1, Math.max(0, localT / Math.max(dur, 0.1)));
  let pos: V3 = [0, 1.5, 5.2];
  let look: V3 = [0, 1.2, 0];
  const roll = 0;

  if (cameraMode === "slow_push") {
    pos = kfVec3(u, [[0, [0, 1.55, 5.6]], [1, [0, 1.48, 4.7]]]);
  } else if (cameraMode === "punch_in") {
    pos = kfVec3(u, [[0, [0, 1.5, 4.2]], [0.35, [0, 1.48, 2.9]], [1, [0, 1.48, 2.75]]], easeOut);
  } else if (cameraMode === "low_angle_tilt") {
    pos = kfVec3(u, [[0, [0.3, 0.65, 3.8]], [1, [-0.2, 0.72, 3.2]]]);
    look = [0, 1.65, -0.4];
  } else if (cameraMode === "top_down_drift") {
    pos = kfVec3(u, [[0, [-0.6, 6.2, 2.6]], [1, [0.6, 5.8, 2.2]]]);
    look = [0, 0.4, -0.5];
  } else if (cameraMode === "macro_push" || cameraMode === "slowmo_impact") {
    const tEff = cameraMode === "slowmo_impact" ? slowMoTime(localT, 0.6, 2.4, 0.25) / Math.max(dur, 0.1) : u;
    pos = kfVec3(tEff, [[0, [0.25, 1.35, 0.4]], [1, [0.05, 1.15, -0.25]]], easeOut);
    look = [0, 1.05, -1.2];
    if (cameraMode === "slowmo_impact") {
      const sh = shake(localT, 2.2, 7);
      pos = [pos[0] + sh[0], pos[1] + sh[1], pos[2] + sh[2]];
    }
  } else if (cameraMode === "whip_right") {
    pos = kfVec3(u, [[0, [-1.4, 1.5, 4.2]], [0.25, [0.9, 1.5, 3.9]], [1, [1.0, 1.5, 3.8]]], easeOut);
    look = [0.6, 1.3, 0];
  } else if (cameraMode === "fly_through") {
    pos = kfVec3(u, [[0, [0, 1.6, 6.8]], [1, [0, 1.4, 2.6]]]);
  }
  // Unknown modes (orbit_gentle, ots_rack, static_punch) keep the default
  // framing, exactly as in Task A. They get real moves when shots are rewritten in Task C.
  return { pos, look, fov, roll };
}
