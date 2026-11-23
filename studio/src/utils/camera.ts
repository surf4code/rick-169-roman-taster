// Pure camera math shared by the 3D layer and the 2D cast overlay.
// No three.js import on purpose: this file is unit-tested with plain Node
// (scripts/test_projection.mjs) and must match THREE.PerspectiveCamera +
// Object3D.lookAt exactly. Roll is in DEGREES.

export type V3 = [number, number, number];

export interface Cam {
  pos: V3;
  look: V3;
  fov: number; // vertical field of view, degrees
  roll: number; // degrees, positive = clockwise horizon tilt
}

export interface ScreenPoint {
  x: number; // px from left
  y: number; // px from top
  depth: number; // metres along the view axis (positive = in front)
  ppm: number; // pixels per metre for a camera-facing billboard at this depth
  roll: number; // screen angle of world-up at this point, degrees
  visible: boolean; // in front of the near plane
}

export const CAM_NEAR = 0.05;
export const CAM_FAR = 300;

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const upFromRoll = (rollDeg: number): V3 => {
  const r = (rollDeg * Math.PI) / 180;
  return [Math.sin(r), Math.cos(r), 0];
};

// Same algorithm as THREE.Matrix4.lookAt(eye, target, up) used by cameras.
export function cameraBasis(c: Cam): { x: V3; y: V3; z: V3 } {
  const up = upFromRoll(c.roll);
  let z = sub(c.pos, c.look);
  if (dot(z, z) === 0) z = [0, 0, 1];
  z = norm(z);
  let x = cross(up, z);
  if (dot(x, x) === 0) {
    if (Math.abs(up[2]) === 1) z = norm([z[0] + 0.0001, z[1], z[2]]);
    else z = norm([z[0], z[1], z[2] + 0.0001]);
    x = cross(up, z);
  }
  x = norm(x);
  const y = cross(z, x);
  return { x, y, z };
}

export function projector(c: Cam, w: number, h: number) {
  const { x: bx, y: by, z: bz } = cameraBasis(c);
  const f = 1 / Math.tan(((c.fov * Math.PI) / 180) / 2);
  const aspect = w / h;
  const raw = (p: V3) => {
    const d = sub(p, c.pos);
    const depth = -dot(d, bz);
    const safe = Math.max(depth, 1e-6);
    const nx = ((f / aspect) * dot(d, bx)) / safe;
    const ny = (f * dot(d, by)) / safe;
    return { x: ((nx + 1) / 2) * w, y: ((1 - ny) / 2) * h, depth };
  };
  return (p: V3): ScreenPoint => {
    const a = raw(p);
    const b = raw([p[0], p[1] + 1, p[2]]);
    return {
      x: a.x,
      y: a.y,
      depth: a.depth,
      ppm: (f * (h / 2)) / Math.max(a.depth, 1e-6),
      roll: (Math.atan2(b.x - a.x, a.y - b.y) * 180) / Math.PI,
      visible: a.depth > CAM_NEAR,
    };
  };
}

// Euclidean distance from the camera, for back-to-front sorting.
export const distanceFrom = (c: Cam, p: V3) => len(sub(p, c.pos));
