import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import charactersData from "../../data/characters.json";
import { EMOTION_LIBRARY, EmotionName } from "../../utils/emotions";
import { GESTURES, blendGesture, hitEase } from "../../utils/gestures";
import { mulberry32 } from "../../utils/anim";
import { restingTurn, solveElbow, hashStr } from "../CutoutCharacter";
import { bodyMat, featureMat, inkMat, mix, INK } from "./materials";
import { Hair3D, Facial3D } from "./Hair3D";
import { HR, SurfaceStroke, onSphere, faceQuat } from "./face";

/**
 * REAL 3D Miko-style character (no textures for the body): every form is a solid.
 *   head = sphere, eyes = ellipsoids, brows/mouth = tubes riding on the sphere, torso = lathe body,
 *   arms/legs = cylinders + round joints, hands = spheres, shoes = ellipsoids.
 * Soft Lambert-like shading from the scene's fixed sun + a patchy white sun-rim + inverted-hull ink outlines.
 * Everything is a continuous function of time (60 fps safe): breathing, head sway, eye drift, brow flutter, hair bob.
 * Units inside the character are "svg-ish" units (head diameter 112, character ~380 tall, feet at y=0); the root scales by 2/392.
 */
const UNIT = 2 / 392;
type V2 = [number, number];
type V3 = [number, number, number];
const D2R = Math.PI / 180;
const SKIN = "#FFF5E6";
const ss = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, w: number) => a + (b - a) * w;

const geoCache = new Map<string, THREE.BufferGeometry>();
const G = (key: string, make: () => THREE.BufferGeometry) => { let g = geoCache.get(key); if (!g) { g = make(); geoCache.set(key, g); } return g; };
const sphereG = () => G("sph", () => new THREE.SphereGeometry(1, 40, 28));
const cylG = (r0: number, r1: number) => G(`cyl${r0}|${r1}`, () => new THREE.CylinderGeometry(r1, r0, 1, 28, 1, false));

/** one solid + its ink hull */
const Solid: React.FC<{ geo: THREE.BufferGeometry; mat: THREE.Material; ink?: number; position?: V3; scale?: V3 | number; quaternion?: THREE.Quaternion; rotation?: V3; cast?: boolean; recv?: boolean }> = ({ geo, mat, ink = 0, position, scale, quaternion, rotation, cast = true, recv = true }) => (
  <group position={position} scale={scale as any} quaternion={quaternion} rotation={rotation as any}>
    <mesh geometry={geo} material={mat} castShadow={cast} receiveShadow={recv} />
    {ink > 0 && <mesh geometry={geo} material={inkMat(ink)} />}
  </group>
);

const Ball: React.FC<{ p: V3; r: number; color: string; ink?: number }> = ({ p, r, color, ink = 2.6 }) => <Solid geo={sphereG()} mat={bodyMat(color)} ink={ink / r} position={p} scale={r} />;

/** cylinder between two points (tapered r0 -> r1) */
const Tube: React.FC<{ a: V3; b: V3; r0: number; r1: number; color: string; ink?: number }> = ({ a, b, r0, r1, color, ink = 2.6 }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va), len = Math.max(d.length(), 0.01);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  const m = va.clone().add(vb).multiplyScalar(0.5);
  // real-length geometry (no non-uniform scale) so the ink hull keeps a constant thickness
  const L = Math.round(len * 2) / 2;
  const geo = G(`tube${r0}|${r1}|${L}`, () => new THREE.CylinderGeometry(r1, r0, L, 28, 1, false));
  const hull = ink > 0 ? G(`tubeH${r0}|${r1}|${L}|${ink}`, () => new THREE.CylinderGeometry(r1 + ink, r0 + ink, L, 28, 1, true)) : null;
  return (
    <group position={[m.x, m.y, m.z]} quaternion={q} scale={[1, len / L, 1]}>
      <mesh geometry={geo} material={bodyMat(color)} castShadow receiveShadow />
      {hull && <mesh geometry={hull} material={inkMat(0)} />}
    </group>
  );
};

/* ---------------- body shapes ---------------- */
const TORSO_Y0 = 127, TORSO_Y1 = 262;
const torsoGeo = () => G("torso", () => {
  const prof: [number, number][] = [[0, 127], [34, 127], [40.5, 131], [43.5, 150], [44.8, 185], [45, 215], [44.2, 238], [40, 252], [30, 259.5], [18, 262], [8, 262.6], [0, 262.6]];
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48);
  g.scale(1, 1, 0.64);
  const pos = g.attributes.position as THREE.BufferAttribute, uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) + 45) / 90; uv[i * 2 + 1] = (pos.getY(i) - TORSO_Y0) / (TORSO_Y1 - TORSO_Y0); }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
});
const skirtGeo = (top: number, hem: number, rTop: number, rHem: number) => G(`skirt${top}|${hem}|${rTop}|${rHem}`, () => {
  const prof: [number, number][] = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10; prof.push([lerp(rTop, rHem, Math.pow(u, 0.8)), lerp(top, hem, u)]); }
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 56);
  g.scale(1, 1, 0.78);
  return g;
});
const shoeGeo = () => G("shoe", () => { const g = new THREE.SphereGeometry(1, 28, 18); g.scale(14, 7.5, 21); return g; });

const skirtTex = (() => {
  const c = new Map<string, THREE.CanvasTexture>();
  return (base: string, accent: string, outfit: string, pattern: string) => {
    const k = `${base}|${accent}|${outfit}|${pattern}`;
    let t = c.get(k); if (t) return t;
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256;
    const g = cv.getContext("2d")!;
    g.fillStyle = base; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 14; i++) { // soft vertical folds
      const x = (i + 0.5) * (512 / 14);
      const gr = g.createLinearGradient(x - 14, 0, x + 14, 0);
      gr.addColorStop(0, "rgba(30,10,40,0)"); gr.addColorStop(0.5, "rgba(30,10,40,0.2)"); gr.addColorStop(1, "rgba(30,10,40,0)");
      g.fillStyle = gr; g.fillRect(x - 14, 0, 28, 256);
    }
    if (outfit !== "robe") { g.fillStyle = accent; g.fillRect(0, 226, 512, 30); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 224, 512, 3); }
    if (pattern === "meander") { g.strokeStyle = outfit === "stola" ? "#FFF3D4" : accent; g.lineWidth = 4; for (let i = 0; i < 26; i++) { const x = i * 20; g.beginPath(); g.moveTo(x, 252); g.lineTo(x + 12, 252); g.lineTo(x + 12, 236); g.lineTo(x + 5, 236); g.lineTo(x + 5, 243); g.stroke(); } }
    t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8;
    c.set(k, t); return t;
  };
})();

/* ---------------- face state helpers ---------------- */
const MOUTH: Record<string, { hw: number; d: number; skew: number; wavy?: number }> = {
  neutral: { hw: 7.2, d: 0.8, skew: 0 }, curious: { hw: 7.2, d: 2.2, skew: 4 }, talking_animated: { hw: 9.6, d: 5.6, skew: 0 },
  skeptical: { hw: 7.2, d: 0, skew: 4 }, happy_relief: { hw: 12, d: 7.6, skew: 0 }, nervous_sweat: { hw: 9.6, d: 0, skew: 0, wavy: 1.6 },
  focused_reading: { hw: 6.4, d: 0, skew: 0 }, confident_point: { hw: 9.2, d: 4, skew: 4 }, embarrassed_blush: { hw: 6.4, d: 2, skew: 0 },
  sad_slump: { hw: 9.6, d: -5.2, skew: 0 }, angry_glare: { hw: 9.6, d: -3.4, skew: 0 }, thinking_chin: { hw: 7.2, d: -1, skew: -1 },
  shrug_question: { hw: 8.8, d: 0, skew: 0, wavy: 1.2 }, celebrate_arms_up: { hw: 12, d: 7.6, skew: 0 }, cradle_calm: { hw: 6.4, d: 2, skew: 0 },
  shocked: { hw: 5, d: -2, skew: 0 }, surprised_jump: { hw: 5, d: -2, skew: 0 },
};
const mouthFor = (e: string) => MOUTH[e] || MOUTH.neutral;
const SHOCKY = new Set(["shocked", "surprised_jump"]);
const HAPPY = new Set(["happy_relief", "celebrate_arms_up"]);

export interface Char3DProps {
  characterId: string;
  position: V3;
  scale?: number;
  flipX?: boolean;
  camPos?: V3;
  lookAt?: V3;
  emotion?: EmotionName;
  prevEmotion?: EmotionName;
  sinceT?: number;
  time: number;
  talking?: boolean;
  turn?: number;
  collar?: boolean;
  torsoTex?: THREE.Texture | null;
  bg?: boolean;
}

const MopMesh: React.FC<{ top: V3; base: V3 }> = ({ top, base }) => {
  const d = new THREE.Vector3(top[0] - base[0], top[1] - base[1], top[2] - base[2]);
  const len = d.length(); d.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const mid: V3 = [(top[0] + base[0]) / 2, (top[1] + base[1]) / 2, (top[2] + base[2]) / 2];
  return (
    <group>
      <group position={mid} quaternion={q}>
        <mesh castShadow><cylinderGeometry args={[0.022, 0.022, len, 14]} /><primitive object={bodyMat("#9A6A3A")} attach="material" /></mesh>
        <mesh><cylinderGeometry args={[0.022, 0.022, len, 14]} /><primitive object={inkMat(0.012)} attach="material" /></mesh>
      </group>
      <group position={base}>
        <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.2, 24]} /><meshBasicMaterial color="#6B4A3A" transparent opacity={0.22} /></mesh>
        <mesh scale={[0.17, 0.045, 0.1]} castShadow><sphereGeometry args={[1, 24, 16]} /><primitive object={bodyMat("#EFE4C8")} attach="material" /></mesh>
        <mesh scale={[0.17, 0.045, 0.1]}><sphereGeometry args={[1, 24, 16]} /><primitive object={inkMat(0.07)} attach="material" /></mesh>
        <mesh position={[0, 0.04, 0]} scale={[0.18, 0.02, 0.1]}><sphereGeometry args={[1, 18, 10]} /><primitive object={bodyMat("#C9A66B")} attach="material" /></mesh>
      </group>
    </group>
  );
};

export const Char3D: React.FC<Char3DProps> = ({ characterId, position, scale = 1, flipX = false, camPos, lookAt, emotion = "neutral", prevEmotion, sinceT = 99, time, talking = false, turn, collar = false, torsoTex, bg = false }) => {
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;
  const poseFrom = EMOTION_LIBRARY[prevEmotion || emotion] || pose;
  const t = time;
  const hid = hashStr(characterId);
  const ph = (hid % 628) / 100;
  const pick = (k: number, m: number) => ((hid >>> k) % m);
  const finalScale = scale * (spec.heightScale ?? 1.0);
  const outfit: string = spec.outfit || "tunic";
  const shirt: string = outfit === "cuirass" ? "#D6A64E" : spec.bodyColor;
  const accent: string = spec.accentColor;
  const scrub = emotion === "scrub";

  /* ---- blend emotion parameters (prev -> current, with a small overshoot) ---- */
  const w = prevEmotion && prevEmotion !== emotion ? hitEase(sinceT / 0.5) : 1;
  const L = (a: number, b: number) => lerp(a, b, w);
  const gTo = GESTURES[emotion] || GESTURES.neutral, gFrom = GESTURES[prevEmotion || emotion] || gTo;
  const g = blendGesture(gFrom, gTo, w);
  const eyeScaleY = L(poseFrom.eyeScaleY, pose.eyeScaleY) * lerp(HAPPY.has(prevEmotion || emotion) ? 0.45 : 1, HAPPY.has(emotion) ? 0.45 : 1, w);
  const browLdeg = L(poseFrom.browLeftDeg, pose.browLeftDeg), browRdeg = L(poseFrom.browRightDeg, pose.browRightDeg);
  const blush = lerp(poseFrom.showBlush ? 1 : 0, pose.showBlush ? 1 : 0, w);
  const shock = lerp(SHOCKY.has(prevEmotion || emotion) ? 1 : 0, SHOCKY.has(emotion) ? 1 : 0, w);
  const mA = mouthFor(prevEmotion || emotion), mB = mouthFor(emotion);
  const mouth = { hw: L(mA.hw, mB.hw), d: L(mA.d, mB.d), skew: L(mA.skew, mB.skew), wavy: L(mA.wavy || 0, mB.wavy || 0) };
  const env = talking ? Math.max(0, Math.min(1, 0.5 + 0.38 * Math.sin(t * 9.1 + ph) + 0.22 * Math.sin(t * 5.3 + 1.7) + 0.12 * Math.sin(t * 13.7))) : 0;

  /* ---- continuous idle ---- */
  const lean = pose.torsoLeanDeg * w + poseFrom.torsoLeanDeg * (1 - w) + 1.2 * Math.sin(t * 0.9 + ph) + (talking ? 0.8 * env : 0) + 0.35 * Math.sin(t * 2.3 + ph * 2);
  const breath = 1 + 0.014 * Math.sin((t * 2 * Math.PI) / 3.3 + ph);
  const tilt = L(poseFrom.headTiltDeg, pose.headTiltDeg) + 1.6 * Math.sin(t * 1.1 + ph * 1.3 - 0.5) + 0.6 * Math.sin(t * 3.1 + ph) + (talking ? 2.4 * Math.sin(t * 6.4 + ph) * env : 0);
  const sway = 0.010 * Math.sin(t * 0.63 + ph) + 0.004 * Math.sin(t * 1.9 + ph * 3);
  const toward = (p?: V3) => (p ? Math.atan2(p[0] - position[0], p[2] - position[2]) : 0);
  const clampA = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const bodyYaw = (camPos ? clampA(toward(camPos) * 0.5, 0.5) : 0) + (turn !== undefined ? turn * 0.16 : 0) + 0.02 * Math.sin(t * 0.5 + ph);
  const headRelYaw = (lookAt && camPos ? clampA(toward(lookAt) - toward(camPos), 0.35) * 0.4 : 0) + (turn !== undefined ? turn * 0.78 : restingTurn(characterId) * 0.5) + 0.03 * Math.sin(t * 0.7 + ph * 1.7) + 0.012 * Math.sin(t * 2.6 + ph);
  const headPitch = (scrub ? 0.3 : 0) + 0.025 * Math.sin(t * 0.9 + ph * 0.5) + (talking ? 0.03 * Math.sin(t * 7 + ph) * env : 0) - g.headDown * 0.004;

  /* ---- eyes ---- */
  const cycle = Math.floor(t / 3.1), rng = mulberry32(((hid >>> 3) + cycle * 7919) >>> 0);
  const bs = rng() * 2.3, bt = (t - cycle * 3.1) - bs;
  const closure = bt >= 0 && bt <= 0.17 ? Math.sin((bt / 0.17) * Math.PI) : 0;
  const eyeOpen = Math.max(0.06, (1 - closure * 0.94)) * eyeScaleY * (1 + 0.28 * shock);
  const eyeDx = 0.8 * Math.sin(t * 0.9 + ph) + 0.35 * Math.sin(t * 2.7 + ph * 2) + pose.pupilOffsetX * 0.25;
  const eyeDy = 0.45 * Math.sin(t * 1.3 + ph * 1.5);
  const gap = (17 + pick(5, 4) * 1.1) * 1.12, eyeRx = (3.5 + pick(1, 4) * 0.35) * 1.12, eyeRy = (7.0 + pick(3, 4) * 0.45) * 1.12;
  const browLen = (11 + pick(9, 3) * 2) * 1.12, browW = (4.4 + pick(7, 3) * 0.5) * 0.5 * 1.12, browTilt = (pick(11, 5) - 2) * 1.6;
  const flutter = 0.35 * Math.sin(t * 1.7 + ph) + 0.2 * Math.sin(t * 4.1 + ph);

  /* ---- arms (2-bone IK in svg-ish coordinates, converted to local) ---- */
  const L1 = 76, L2 = 68, SK = 1.55;
  const idle = (k: number, amp: number) => amp * (Math.sin(t * 0.8 + ph + k) + 0.6 * Math.sin(t * 1.9 + ph * 2 + k));
  const beat = env * (Math.sin(t * 5.1 + ph) * 0.5 + 0.5);
  const fid = g.fidget * 5;
  const lift = g.shrug + 0.5 * Math.sin((t * 2 * Math.PI) / 3.3 + ph);
  const mkArm = (side: 1 | -1) => {
    const tgt = side === 1 ? g.R : g.L, pole = side === 1 ? g.poleR : g.poleL;
    const S: V2 = [140 + side * 40, 152 - lift];
    const front = side === 1;
    const tx = tgt[0] + idle(side, 1.6) + (front ? beat * 9 : beat * 3) + fid * Math.sin(t * 9 + side * 1.7);
    const ty = tgt[1] + idle(side + 2, 1.4) - (front ? beat * 14 : beat * 5) + fid * 0.8 * Math.cos(t * 8.2 + side) + 0.8 * Math.sin((t * 2 * Math.PI) / 3.3 + ph - 0.7);
    let tipX = tx, tipY = ty;
    if (scrub) { const sp = Math.sin(t * 3.4); tipX = (front ? -8 : -15) + 12 * sp; tipY = (front ? 88 : 74) + 3 * Math.cos(t * 6.8); }
    const tip: V2 = [S[0] + side * tipX * SK, S[1] + tipY * SK];
    const sol = solveElbow(S, tip, L1, L2, [side * pole[0], pole[1]]);
    return { S, E: sol.E, W: sol.W };
  };
  const armR = mkArm(1), armL = mkArm(-1);
  const loc = (p: V2, z = 0): V3 => [p[0] - 140, 390 - p[1], z];
  // keep sleeves outside the body: arms swing forward of the torso when they cross in front of it
  const armZ = (p: V2) => { if (scrub) return 40; const xo = Math.abs(p[0] - 140), yUp = 390 - p[1]; const vert = ss(105, 135, yUp) * (1 - ss(268, 290, yUp)); return 8 + 36 * ss(50, 6, xo) * vert; };
  const A3 = (a: { S: V2; E: V2; W: V2 }, zOff: number) => ({ S: loc(a.S, 4), E: loc(a.E, armZ(a.E) + zOff), W: loc(a.W, armZ(a.W) + zOff) });
  const aR = A3(armR, 3), aL = A3(armL, -2);

  /* ---- legs ---- */
  const shift = Math.sin(t * 0.55 + ph);
  const leg = (side: 1 | -1) => {
    const H: V2 = [140 + side * 12, 250], F: V2 = [140 + side * (13 + 1.5 * Math.max(0, -side * shift)), 376];
    const sol = solveElbow(H, F, 66, 66, [side * 0.3, 1]);
    const mx = (H[0] + F[0]) / 2, my = (H[1] + F[1]) / 2;
    const K: V2 = [mx + (sol.E[0] - mx) * 0.35, my + (sol.E[1] - my) * 0.35];
    return { H: loc(H), K: loc(K), F: loc(F) };
  };
  const legs = [leg(1), leg(-1)];

  const SPH = sphereG();
  const headY = 262 - g.headDown + 61;
  const hairId = spec.hairStyle === "messy_tuft" ? "curl" : spec.hairStyle;
  const skirtOn = outfit === "stola" || outfit === "robe" || outfit === "toga";
  const skirtCol = outfit === "toga" ? "#F1EEF6" : outfit === "robe" ? "#16382B" : shirt;
  const stm = useMemo(() => (skirtOn ? skirtTex(skirtCol, accent, outfit, spec.pattern || "none") : null), [skirtOn, skirtCol, accent, outfit, spec.pattern]);
  const torsoMat = useMemo(() => {
    const m = bodyMat(shirt).clone() as THREE.MeshStandardMaterial;
    m.onBeforeCompile = bodyMat(shirt).onBeforeCompile; m.onBeforeRender = bodyMat(shirt).onBeforeRender; m.customProgramCacheKey = () => "bodyrim";
    return m;
  }, [shirt]);
  useEffect(() => { torsoMat.map = torsoTex ?? null; torsoMat.color.set(torsoTex ? "#FFFFFF" : shirt); torsoMat.needsUpdate = true; }, [torsoTex, torsoMat, shirt]);
  const skirtMat = useMemo(() => {
    const b = bodyMat("#FFFFFF"); const m = b.clone();
    m.onBeforeCompile = b.onBeforeCompile; m.onBeforeRender = b.onBeforeRender; m.customProgramCacheKey = () => "bodyrim"; m.side = THREE.DoubleSide;
    return m;
  }, []);
  useEffect(() => { skirtMat.map = stm; skirtMat.needsUpdate = true; }, [stm, skirtMat]);

  // mop (hands hold it): top = midpoint of wrists, base on the floor swinging with the stroke
  const mopTop: V3 = [(aR.W[0] + aL.W[0]) / 2 * UNIT, (aR.W[1] + aL.W[1]) / 2 * UNIT, (aR.W[2] + aL.W[2]) / 2 * UNIT];
  const sp = Math.sin(t * 3.4);

  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#120B1C" transparent opacity={0.34} /></mesh>
      <group rotation={[0, bodyYaw, 0]}>
        <group scale={UNIT}>
          {/* ---- legs + shoes ---- */}
          {legs.map((l, i) => {
            const side = i === 0 ? 1 : -1;
            return (
              <group key={`leg${i}`}>
                <Tube a={l.H} b={l.K} r0={10.6} r1={10} color={SKIN} ink={2.4} />
                <Tube a={l.K} b={l.F} r0={10} r1={9.2} color={SKIN} ink={2.4} />
                <Ball p={l.K} r={10} color={SKIN} ink={2.4} />
                <Solid geo={shoeGeo()} mat={bodyMat("#A8703A")} ink={2.2} position={[l.F[0] + side * 1.5, 8.5, 9]} rotation={[0, side * 0.12, 0]} />
              </group>
            );
          })}
          {skirtOn && <Solid geo={skirtGeo(150, 50, 42, 60)} mat={skirtMat} ink={2.4} position={[0, 0, 0]} />}
          {outfit === "cuirass" && <mesh position={[0, 190, -30]} castShadow><boxGeometry args={[104, 150, 5]} /><primitive object={bodyMat("#B91C1C")} attach="material" /></mesh>}

          {/* ---- torso (leans about the hips) ---- */}
          <group position={[0, 140, 0]} rotation={[0, 0, -(lean + sway * 57.3) * D2R]}>
            <group position={[0, -140, 0]} scale={[1 + (breath - 1) * 0.4, breath, 1 + (breath - 1) * 0.4]}>
              <Solid geo={torsoGeo()} mat={torsoMat} ink={3.2} />
              {/* neck */}
              <Tube a={[0, 256 - g.headDown * 0.5, 0]} b={[0, 280 - g.headDown * 0.5, 0]} r0={8} r1={8} color="#F4EEF2" ink={2.6} />
              {collar && (
                <group position={[0, 262, 0]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[13.5, 3.6, 14, 40]} /><primitive object={bodyMat("#D3A04A", { metalness: 0.3, roughness: 0.5 })} attach="material" /></mesh>
                  <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[13.5, 3.6, 14, 40]} /><primitive object={inkMat(1.3)} attach="material" /></mesh>
                  <Ball p={[0, -14, 14]} r={7.5} color="#D3A04A" ink={2} />
                </group>
              )}
              {/* arms */}
              {[aR, aL].map((a, i) => (
                <group key={`arm${i}`}>
                  <Ball p={a.S} r={13.2} color={shirt} ink={2.6} />
                  <Tube a={a.S} b={a.E} r0={12.6} r1={11.8} color={shirt} ink={2.6} />
                  <Ball p={a.E} r={11.8} color={shirt} ink={2.6} />
                  <Tube a={a.E} b={a.W} r0={11.8} r1={10.6} color={shirt} ink={2.6} />
                  <Ball p={a.W} r={13.6} color={SKIN} ink={2.6} />
                </group>
              ))}
              {/* ---- head: pivots at the neck base ---- */}
              <group position={[0, headY - 61, 0]} rotation={[headPitch, headRelYaw, -tilt * D2R]}>
                <group position={[0, 61, 0]}>
                  <Solid geo={SPH} mat={bodyMat(SKIN, { rim: 1.1 })} ink={3.6 / HR} scale={HR} />
                  {/* eyes (ellipsoids hugging the sphere) */}
                  {[-1, 1].map((sd) => {
                    const ex = sd * gap + eyeDx, ey = 1.1 + eyeDy;
                    const p = onSphere(ex, ey, 0.6);
                    return (
                      <group key={`eye${sd}`} position={p} quaternion={faceQuat(p)}>
                        <mesh geometry={SPH} material={featureMat()} scale={[eyeRx, eyeRy * eyeOpen, 2.6]} />
                        {eyeOpen > 0.3 && <mesh geometry={SPH} position={[eyeRx * 0.28, eyeRy * eyeOpen * 0.42, 1.9]} scale={1.35}><meshBasicMaterial color="#FFFFFF" toneMapped={false} /></mesh>}
                      </group>
                    );
                  })}
                  {/* brows = tubes */}
                  {[-1, 1].map((sd) => {
                    const deg = sd === -1 ? browLdeg + browTilt : browRdeg + browTilt;
                    const lift = (sd === -1 ? g.browLiftL : g.browLiftR) * 1.1 + flutter * sd * 0.4;
                    const cx = sd * gap, cy = (17 + lift / 1.12) * 1.12 + 1;
                    const a = -deg * D2R, pts: V2[] = [];
                    for (let k = 0; k <= 4; k++) { const u = (k / 4 - 0.5) * browLen, bow = -0.9 * (1 - Math.pow((k / 4 - 0.5) * 2, 2)); pts.push([cx + u * Math.cos(a) - bow * Math.sin(a), cy + u * Math.sin(a) + bow * Math.cos(a)]); }
                    return <SurfaceStroke key={`brow${sd}`} pts={pts} radius={browW} lift={0.4} mat={featureMat(INK, 0.5)} />;
                  })}
                  {/* mouth */}
                  <Mouth3D mouth={mouth} open={env} shock={shock} />
                  {blush > 0.02 && [-1, 1].map((sd) => {
                    const p = onSphere(sd * 33, -10, 0.1);
                    return <mesh key={`bl${sd}`} geometry={SPH} position={p} quaternion={faceQuat(p)} scale={[9, 5.2, 1.4 * blush]}><meshBasicMaterial color="#F27C8C" transparent opacity={0.6 * blush} toneMapped={false} /></mesh>;
                  })}
                  <Hair3D style={hairId} color={spec.hairColor || "#4A3222"} accent={accent} t={t} ph={ph} />
                  <Facial3D kind={spec.facial} color={spec.hairColor || "#4A3222"} />
                </group>
              </group>
            </group>
          </group>
        </group>
        {scrub && <MopMesh top={mopTop} base={[mopTop[0] + 0.3 + 0.45 * sp, 0.04, 0.5]} />}
      </group>
    </group>
  );
};

/** closed mouth = tube along a curve on the sphere; talking = dark ellipsoid cavity with teeth + tongue (continuous openness). */
const Mouth3D: React.FC<{ mouth: { hw: number; d: number; skew: number; wavy: number }; open: number; shock: number }> = ({ mouth, open, shock }) => {
  const y0 = -25;
  const pts: V2[] = [];
  for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([lerp(-mouth.hw, mouth.hw, u), y0 - mouth.d * (1 - 4 * (u - 0.5) * (u - 0.5)) + mouth.skew * (u - 0.5) + mouth.wavy * Math.sin(u * Math.PI * 3)]); }
  const SPH = sphereG();
  const cav = Math.max(open, shock * 0.7);
  const closedAmt = 1 - Math.min(1, cav * 3);
  const p = onSphere(0, y0 - 5 * cav, 0.4);
  return (
    <group>
      <group scale={[1, 1, 1]}>{closedAmt > 0.02 && <SurfaceStroke pts={pts} radius={1.9 * (0.3 + 0.7 * closedAmt)} lift={0.5} mat={featureMat(INK, 0.5)} />}</group>
      {cav > 0.02 && (
        <group position={p} quaternion={faceQuat(p)}>
          <mesh geometry={SPH} scale={[Math.max(2, mouth.hw * 0.9 * (shock > 0.5 ? 0.55 : 1)), 2 + cav * 11, 2.6]}><meshStandardMaterial color="#3A1218" roughness={0.6} /></mesh>
          {open > 0.25 && <mesh geometry={SPH} position={[0, 2 + cav * 5, 2.1]} scale={[mouth.hw * 0.7, 1.4, 0.8]}><meshStandardMaterial color="#FFFFFF" roughness={0.5} /></mesh>}
          {open > 0.45 && <mesh geometry={SPH} position={[0, -2 - cav * 4, 1.6]} scale={[mouth.hw * 0.5, 2.6, 0.9]}><meshStandardMaterial color="#EC5C72" roughness={0.6} /></mesh>}
        </group>
      )}
    </group>
  );
};
