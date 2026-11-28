import * as THREE from "three";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const easeInOut = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
export const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export function kfNumber(
  t: number,
  keys: [number, number][],
  ease: (x: number) => number = smooth
): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / Math.max(t1 - t0, 1e-6)));
  }
  return keys[keys.length - 1][1];
}

export function kfVec3(
  t: number,
  keys: [number, [number, number, number]][],
  ease: (x: number) => number = smooth
): [number, number, number] {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const k = ease((t - t0) / Math.max(t1 - t0, 1e-6));
      return [lerp(v0[0], v1[0], k), lerp(v0[1], v1[1], k), lerp(v0[2], v1[2], k)];
    }
  }
  return keys[keys.length - 1][1];
}

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function cam169(fov = 38): THREE.PerspectiveCamera {
  return new THREE.PerspectiveCamera(fov, 1920 / 1080, 0.05, 300);
}

export function place(
  c: THREE.PerspectiveCamera,
  pos: [number, number, number],
  look: [number, number, number],
  roll = 0
): void {
  c.position.set(pos[0], pos[1], pos[2]);
  c.up.set(Math.sin(roll), Math.cos(roll), 0);
  c.lookAt(look[0], look[1], look[2]);
}

export function shake(t: number, amp = 1, seed = 0): [number, number, number] {
  const f = (a: number, b: number, c: number) =>
    Math.sin(t * a + seed) * 0.5 +
    Math.sin(t * b + seed * 2.3) * 0.3 +
    Math.sin(t * c + seed * 4.1) * 0.2;
  return [
    f(1.3, 2.9, 5.1) * 0.008 * amp,
    f(1.7, 3.3, 4.7) * 0.008 * amp,
    f(0.9, 2.1, 6.3) * 0.005 * amp,
  ];
}

export function slowMoTime(t: number, start: number, end: number, factor = 0.25): number {
  if (t <= start) return t;
  if (t <= end) return start + (t - start) * factor;
  return start + (end - start) * factor + (t - end);
}
