// B0 test: the 2D cast projector must match the 3D camera exactly.
//   node scripts/test_projection.mjs
// 1) closed-form checks of utils/camera.ts (always run)
// 2) if three is present in node_modules: 2,000 random cameras/points vs THREE.Vector3.project
// 3) prints where each character's feet land in key StyleTestOpening frames
import { register } from "node:module";
import { spawnSync } from "node:child_process";

// Needs Node's built-in TypeScript stripping (default in Node >= 23.6, flag in 22.6+).
const [major, minor] = process.versions.node.split(".").map(Number);
if (!process.features?.typescript) {
  if (major > 22 || (major === 22 && minor >= 6)) {
    const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", ...process.argv.slice(1)], { stdio: "inherit" });
    process.exit(r.status ?? 1);
  }
  console.error(`test:proj needs Node >= 22.6 (found ${process.versions.node}). Renders still work on Node 20.`);
  process.exit(2);
}
register("./lib/ts-resolve-hook.mjs", import.meta.url);

const { projector, cameraBasis } = await import("../src/utils/camera.ts");
const { shotCamera, shotFov } = await import("../src/utils/shotCamera.ts");
const fs = await import("node:fs");

let fails = 0;
const near = (a, b, tol, msg) => {
  const ok = Math.abs(a - b) <= tol;
  if (!ok) { fails++; console.log(`FAIL ${msg}: got ${a}, want ${b}`); }
  return ok;
};
const W = 1920, H = 1080;

// --- 1. closed form ---
{
  const P = projector({ pos: [0, 0, 5], look: [0, 0, 0], fov: 90, roll: 0 }, W, H);
  const o = P([0, 0, 0]);
  near(o.x, 960, 1e-9, "centre x"); near(o.y, 540, 1e-9, "centre y"); near(o.depth, 5, 1e-9, "depth");
  near(P([0, 1, 0]).y, 432, 1e-9, "1 m up at 5 m, fov 90");
  near(P([1, 0, 0]).x, 960 * (1 + 1 / (W / H) / 5), 1e-9, "1 m right");
  near(o.ppm, 540 / 5, 1e-9, "ppm = f*(H/2)/depth");
  near(o.roll, 0, 1e-9, "no roll");
  const R = projector({ pos: [0, 0, 5], look: [0, 0, 0], fov: 90, roll: 90 }, W, H);
  near(Math.abs(R([0, 1, 0]).roll), 90, 1e-6, "roll 90 turns world-up sideways");
  const b = cameraBasis({ pos: [0, 10, 0], look: [0, 0, 0], fov: 40, roll: 0 });
  if (!b.x.every(Number.isFinite)) { fails++; console.log("FAIL straight-down basis not finite"); }
  console.log(`closed-form checks: ${fails === 0 ? "PASS" : "FAIL"}`);
}

// --- 2. against three.js ---
let THREE = null;
try { THREE = await import("three"); } catch { /* not present */ }
if (THREE) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let maxErr = 0, n = 0;
  for (let i = 0; i < 2000; i++) {
    const cam = {
      pos: [rnd() * 12 - 6, rnd() * 6 + 0.2, rnd() * 10 - 2],
      look: [rnd() * 4 - 2, rnd() * 2, rnd() * 4 - 4],
      fov: 20 + rnd() * 50,
      roll: rnd() * 10 - 5,
    };
    const tc = new THREE.PerspectiveCamera(cam.fov, W / H, 0.05, 300);
    const r = (cam.roll * Math.PI) / 180;
    tc.position.set(...cam.pos); tc.up.set(Math.sin(r), Math.cos(r), 0); tc.lookAt(...cam.look);
    tc.updateProjectionMatrix(); tc.updateMatrixWorld();
    const p = [rnd() * 6 - 3, rnd() * 2, rnd() * 6 - 4];
    const mine = projector(cam, W, H)(p);
    if (!mine.visible) continue;
    const v = new THREE.Vector3(...p).project(tc);
    n++;
    maxErr = Math.max(maxErr, Math.abs(((v.x + 1) / 2) * W - mine.x), Math.abs(((1 - v.y) / 2) * H - mine.y));
  }
  const ok = maxErr < 0.01;
  if (!ok) fails++;
  console.log(`three.js parity (${n} cases): max error ${maxErr.toExponential(2)} px -> ${ok ? "PASS" : "FAIL"}`);
} else {
  console.log("three.js parity: SKIPPED (three not in node_modules on this machine)");
}

// --- 3. placement report ---
{
  const chars = JSON.parse(fs.readFileSync(new URL("../src/data/characters.json", import.meta.url)));
  const plan = JSON.parse(fs.readFileSync(new URL("../src/data/styleTestShots.json", import.meta.url)));
  const frames = process.argv.slice(2).map(Number).filter(Number.isFinite);
  for (const frame of frames.length ? frames : [60, 525, 740, 830, 1530]) {
    const t = frame / 30;
    const shot = plan.shots.find((s) => t >= s.start && t < s.end);
    if (!shot) continue;
    const cam = shotCamera(shot.camera, t - shot.start, shot.end - shot.start, shotFov(shot.type));
    const P = projector(cam, W, H);
    console.log(`frame ${frame} (${shot.id}, ${shot.camera}):`);
    for (const c of shot.characters || []) {
      const spec = chars.cast[c.id] || chars.cast.taster_protagonist;
      const hM = chars.defaults.baseHeightM * (spec.heightScale ?? 1) * (c.scale ?? 1);
      const f = P(c.pos), hd = P([c.pos[0], c.pos[1] + hM, c.pos[2]]);
      const inFrame = f.visible && f.x > -50 && f.x < W + 50 && hd.y < H && f.y > 0;
      console.log(`  ${c.id.padEnd(20)} feet=(${f.x.toFixed(0)},${f.y.toFixed(0)}) head_y=${hd.y.toFixed(0)} height=${(f.y - hd.y).toFixed(0)}px${inFrame ? "" : "  <-- OUT OF FRAME"}`);
    }
    for (const fp of shot.frontProps || []) {
      const f = P(fp.pos);
      console.log(`  [front] ${fp.kind.padEnd(16)} base=(${f.x.toFixed(0)},${f.y.toFixed(0)})`);
    }
  }
}
process.exit(fails ? 1 : 0);
