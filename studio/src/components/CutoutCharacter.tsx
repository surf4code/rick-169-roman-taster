import React, { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { continueRender, delayRender } from "remotion";
import charactersData from "../data/characters.json";
import { EmotionName, EMOTION_LIBRARY } from "../utils/emotions";
import { mulberry32 } from "../utils/anim";
import { CharacterId, CharacterSvg } from "./CharacterSvg";

export type { CharacterId };

/**
 * WHY THIS FILE LOOKS LIKE THIS (fix for "characters invisible in real renders"):
 *  1. drei <Html> is a DOM overlay that Remotion's frame capture does not render reliably.
 *  2. Textures must be prepared OUTSIDE <ThreeCanvas> (in the normal React tree) with
 *     delayRender(), because children of ThreeCanvas mount asynchronously and a delayRender() made
 *     inside them can register AFTER Remotion has already taken the screenshot (verified: the
 *     render finished with an empty texture).
 * So: characterMarkup() builds the SVG string from the SAME CharacterSvg rig, useSvgTextures()
 * rasterises all of them to canvas textures (blocking the capture until ready), and
 * <CutoutCharacter texture=... /> draws that texture on a plane inside the 3D scene
 * (depth-sorted, post-processed, shadow disc on the ground).
 *
 * SVG region captured (svg units): x -40..320, y 60..380. Feet sit at svg y=364; the figure is about
 * 278 svg units tall (feet to head top), mapped to 2.0 world units at scale 1.
 */
const REGION = { x: -40, y: 60, w: 360, h: 320 };
const TEX_SCALE = 3; // texture pixels per svg unit
const WORLD_PER_UNIT = 2.0 / 302;
const FEET_SVG_Y = 390;
const PLANE_W = REGION.w * WORLD_PER_UNIT;
const PLANE_H = REGION.h * WORLD_PER_UNIT;
const PLANE_CENTER_Y = PLANE_H / 2 - (REGION.y + REGION.h - FEET_SVG_Y) * WORLD_PER_UNIT;

export interface CharacterMarkupInput {
  characterId: CharacterId;
  emotion: EmotionName;
  frame: number;
  fps: number;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  stepOnTwos?: boolean;
  layer?: "all" | "lower" | "torso" | "head";
  turn?: number;
}

/** Pure function: the exact SVG markup for one character on one frame (blink/breath/talk included). */
export function characterMarkup(i: CharacterMarkupInput): string {
  const { characterId, emotion, frame, fps, rmsAmplitude = 0, spectralCentroid = 0.5, stepOnTwos = true, layer = "all", turn = 0 } = i;
  const charFrame = stepOnTwos ? Math.floor(frame / 2) * 2 : frame;
  let seed = 2166136261;
  for (let k = 0; k < characterId.length; k++) seed = Math.imul(seed ^ characterId.charCodeAt(k), 16777619);
  seed = seed >>> 0;

  const cycleLen = Math.floor(fps * 3.1);
  const cycle = Math.floor(charFrame / (fps * 3.1));
  const rng = mulberry32(seed + cycle);
  const blinkStart = Math.floor(rng() * (fps * 2.4));
  const localF = charFrame % cycleLen;
  const isBlinking = localF >= blinkStart && localF <= blinkStart + 3;
  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 2.5;
  const talkNod = rmsAmplitude > 0.18 ? Math.sin(charFrame * 0.65) * 3.2 * rmsAmplitude : 0;

  return renderToStaticMarkup(
    <CharacterSvg
      characterId={characterId}
      emotion={emotion}
      rmsAmplitude={rmsAmplitude}
      spectralCentroid={spectralCentroid}
      isBlinking={isBlinking}
      breathY={breathY}
      talkNod={talkNod}
      uid={`${characterId}-3d`}
      layer={layer}
      turn={turn}
    />
  );
}

function toDataUrl(markup: string): string {
  const svg = markup.replace(
    /<svg[^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${REGION.w * TEX_SCALE}" height="${REGION.h * TEX_SCALE}" viewBox="${REGION.x} ${REGION.y} ${REGION.w} ${REGION.h}">`
  );
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function loadTexture(markup: string): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = REGION.w * TEX_SCALE;
      canvas.height = REGION.h * TEX_SCALE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => reject(new Error("Character SVG failed to load"));
    img.src = toDataUrl(markup);
  });
}

const TEX_CACHE = new Map<string, THREE.CanvasTexture>();
const MAX_CACHE = 300;
function cacheSet(k: string, t: THREE.CanvasTexture) {
  TEX_CACHE.set(k, t);
  if (TEX_CACHE.size > MAX_CACHE) {
    const first = TEX_CACHE.keys().next().value as string;
    TEX_CACHE.get(first)?.dispose();
    TEX_CACHE.delete(first);
  }
}

/**
 * Call this in the normal React tree (NOT inside ThreeCanvas). Pass {key: markup}. Returns {key: texture|null}.
 * Textures are cached by markup (instant when seen before) and the previous texture of a key is held while the
 * new one rasterises, so a character can never pop out for a frame. The capture is blocked until every
 * texture is ready and several animation frames have passed.
 */
export function useSvgTextures(markups: Record<string, string>): Record<string, THREE.CanvasTexture | null> {
  const signature = JSON.stringify(markups);
  const [, setTick] = useState(0);
  const lastRef = useRef<Record<string, THREE.CanvasTexture>>({});
  const handleFor = useRef<{ sig: string; handle: number } | null>(null);

  const missing = Object.entries(markups).filter(([, m]) => !TEX_CACHE.has(m));
  if (missing.length > 0 && (!handleFor.current || handleFor.current.sig !== signature)) {
    handleFor.current = { sig: signature, handle: delayRender("character textures") };
  }

  useEffect(() => {
    const mine = handleFor.current;
    if (!mine || mine.sig !== signature) return;
    let cancelled = false;
    let r = 0;
    const todo = Object.values(markups).filter((m) => !TEX_CACHE.has(m));
    Promise.all(todo.map(async (m) => [m, await loadTexture(m)] as const))
      .then((pairs) => {
        pairs.forEach(([m, t]) => cacheSet(m, t));
        if (cancelled) { continueRender(mine.handle); return; }
        setTick((x) => x + 1);
        let n = 0;
        const step = () => { if (++n < 4) r = requestAnimationFrame(step); else setTimeout(() => continueRender(mine.handle), 150); };
        r = requestAnimationFrame(step);
      })
      .catch((e) => { continueRender(mine.handle); throw e; });
    return () => { cancelled = true; cancelAnimationFrame(r); };
  }, [signature]);

  const out: Record<string, THREE.CanvasTexture | null> = {};
  for (const [k, m] of Object.entries(markups)) {
    const t = TEX_CACHE.get(m) ?? lastRef.current[k] ?? null;
    if (t) lastRef.current[k] = t;
    out[k] = t;
  }
  return out;
}

export const LAYERS = ["lower", "torso", "head"] as const;
export type LayerName = (typeof LAYERS)[number];
const U = WORLD_PER_UNIT;
const INK_COL = "#231A29";
const HIP_Y = 278; // svg y of hips
const NECK_Y = 186; // svg y of head pivot (chin)

/** Resting 3/4 turn per character (never dead-front), sign + size seeded by id. */
export function restingTurn(id: string): number {
  let h = 7;
  for (let k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
  return (h % 2 ? 1 : -1) * (0.18 + ((h >>> 3) % 5) * 0.04);
}
const hashStr = (id: string) => id.split("").reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const D2R = Math.PI / 180;
const wx = (sx: number) => (sx - 140) * U;
const wy = (sy: number) => (HIP_Y - sy) * U; // relative to the hip

type V2 = [number, number];

/** Brush-like limb: tapered ribbon along a quadratic curve through shoulder->elbow->wrist (or hip->knee->ankle). */
function ribbonGeometry(a: V2, mid: V2, b: V2, w0: number, w1: number, wob: number): THREE.BufferGeometry {
  const ctrl: V2 = [2 * mid[0] - (a[0] + b[0]) / 2, 2 * mid[1] - (a[1] + b[1]) / 2];
  const N = 22, pos: number[] = [], idx: number[] = [];
  const P: V2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    P.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]]);
  }
  for (let i = 0; i <= N; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[Math.min(N, i + 1)];
    let tx = p1[0] - p0[0], ty = p1[1] - p0[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const t = i / N;
    const w = (w0 + (w1 - w0) * t + 0.7 * Math.sin(Math.PI * t) + wob * Math.sin(t * 9 + 1.3)) * 0.5;
    const nx = -ty, ny = tx;
    pos.push(wx(P[i][0] + nx * w), wy(P[i][1] + ny * w), 0, wx(P[i][0] - nx * w), wy(P[i][1] - ny * w), 0);
    if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

const Limb: React.FC<{ a: V2; mid: V2; b: V2; w0: number; w1: number; z: number; hand?: number; wob?: number }> = ({ a, mid, b, w0, w1, z, hand = 0, wob = 0.25 }) => {
  const key = [a, mid, b].map((p) => p.map((v) => v.toFixed(2)).join(",")).join("|") + w0 + w1;
  const geo = React.useMemo(() => ribbonGeometry(a, mid, b, w0, w1, wob), [key]);
  useEffect(() => () => geo.dispose(), [geo]);
  const mat = { color: INK_COL, toneMapped: false, side: THREE.DoubleSide } as const;
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={geo}><meshBasicMaterial {...mat} /></mesh>
      <mesh position={[wx(a[0]), wy(a[1]), 0]} scale={[w0 * 0.5 * U, w0 * 0.5 * U, 1]}><circleGeometry args={[1, 18]} /><meshBasicMaterial {...mat} /></mesh>
      <mesh position={[wx(b[0]), wy(b[1]), 0]} scale={[(hand || w1) * 0.5 * U, (hand || w1) * 0.5 * U, 1]}><circleGeometry args={[1, 22]} /><meshBasicMaterial {...mat} /></mesh>
    </group>
  );
};

export interface CutoutCharacterProps {
  characterId: CharacterId;
  position: [number, number, number];
  scale?: number;
  textures: Partial<Record<LayerName, THREE.Texture | null>>;
  flipX?: boolean;
  camPos?: [number, number, number];
  lookAt?: [number, number, number];
  emotion?: EmotionName;
  time?: number; // seconds (continuous, NOT stepped) -> smooth joints
  talking?: boolean;
}

/** Two-bone limb: returns the elbow/knee for root->tip with bone lengths, bending toward `side`. */
function twoBone(root: V2, tip: V2, l1: number, l2: number, side: 1 | -1): V2 {
  let dx = tip[0] - root[0], dy = tip[1] - root[1];
  let d = Math.hypot(dx, dy); const dMax = (l1 + l2) * 0.999; if (d > dMax) { dx *= dMax / d; dy *= dMax / d; d = dMax; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [root[0] + ux * a + side * -uy * h, root[1] + uy * a + side * ux * h];
}

/**
 * Rick-style rig: 3 painted layers (skirt/torso/head) + REAL 2-bone ink limbs drawn as brush ribbons.
 * Joints are continuous-time (every frame, never on twos); overlapping action: wrist/forearm lag the shoulder,
 * head lags the torso, breathing scales the chest, weight shifts between legs.
 */
export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({ characterId, position, scale = 1, textures, flipX = false, camPos, lookAt, emotion = "neutral", time = 0, talking = false }) => {
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;
  const finalScale = scale * (spec.heightScale ?? 1.0);
  const h = hashStr(characterId);
  const ph = (h % 628) / 100;
  const toward = (t?: [number, number, number]) => (t ? Math.atan2(t[0] - position[0], t[2] - position[2]) : 0);
  const clampA = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const bodyYaw = camPos ? clampA(toward(camPos) * 0.5, 0.5) : 0;
  const headYaw = bodyYaw + (lookAt ? clampA(toward(lookAt) - toward(camPos), 0.35) * 0.4 : 0) + restingTurn(characterId) * 0.25;

  const t = time;
  const env = talking ? Math.max(0, Math.min(1, 0.45 + 0.4 * Math.sin(t * 3.1 + ph) + 0.2 * Math.sin(t * 7.3 + 1))) : 0;
  const lean = pose.torsoLeanDeg + 1.2 * Math.sin(t * 0.9 + ph) + (talking ? 0.8 * env : 0);
  const breath = 1 + 0.014 * Math.sin((t * 2 * Math.PI) / 3.3 + ph);
  const tilt = pose.headTiltDeg + 1.6 * Math.sin(t * 1.1 + ph * 1.3 - 0.5) + (talking ? 2.4 * Math.sin(t * 6.4 + ph) * env : 0);

  // arms: outward angle from straight-down + forearm bend; forearm / hand lag the upper arm (overlapping action)
  const aR = -pose.armRightDeg + 2.6 * Math.sin(t * 1.25 + ph) + 17 * env;
  const aL = pose.armLeftDeg + 2.6 * Math.sin(t * 1.1 + ph + 1) + 3 * env;
  const fR = -pose.forearmRightDeg + 4 * Math.sin(t * 1.25 + ph - 0.9) + 24 * env;
  const fL = 0.4 * -pose.forearmRightDeg + 7 + 3 * Math.sin(t * 1.1 + ph + 0.1);
  const L1 = 46, L2 = 42;
  const arm = (side: 1 | -1, a: number, f: number) => {
    const S: V2 = [140 + side * 42, 206];
    const th = a * D2R, th2 = (a + f) * D2R;
    const E: V2 = [S[0] + side * Math.sin(th) * L1, S[1] + Math.cos(th) * L1];
    const Wr: V2 = [E[0] + side * Math.sin(th2) * L2, E[1] + Math.cos(th2) * L2];
    return { S, E, Wr };
  };
  const armR = arm(1, aR, fR), armL = arm(-1, aL, fL);

  // legs: weight shifts slowly between legs; knees bend, never locked
  const shift = Math.sin(t * 0.55 + ph);
  const leg = (side: 1 | -1) => {
    const bend = 4 + 7 * Math.max(0, side * shift);
    const H: V2 = [140 + side * 17, HIP_Y - 4];
    const F: V2 = [140 + side * (24 + 3 * Math.max(0, -side * shift)), FEET_SVG_Y];
    const K = twoBone(H, F, 62, 58, side);
    K[0] += side * bend * 0.6;
    const toe: V2 = [F[0] + side * 13, F[1] - 1.5];
    return { H, K, F, toe };
  };
  const legR = leg(1), legL = leg(-1);

  const hipWorldY = (FEET_SVG_Y - HIP_Y) * U;
  const planeCy = PLANE_CENTER_Y - hipWorldY; // plane centre relative to hip
  const neckRel = wy(NECK_Y); // neck pivot relative to hip
  const planeMat = { transparent: true, alphaTest: 0.02, toneMapped: false, side: THREE.DoubleSide } as const;
  const plane = (tex: THREE.Texture | null | undefined, y: number, z: number) => tex && (
    <mesh position={[0, y, z]}><planeGeometry args={[PLANE_W, PLANE_H]} /><meshBasicMaterial map={tex} {...planeMat} /></mesh>
  );
  const Lc = (side: 1 | -1) => (side === 1 ? legR : legL);

  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.56, 28]} />
        <meshBasicMaterial color="#1A203A" transparent opacity={0.32} />
      </mesh>
      <group rotation={[0, bodyYaw, 0]}>
        {/* legs (hang from the hip, so they stay planted while the upper body leans) */}
        {([1, -1] as const).map((sd) => {
          const l = Lc(sd);
          return (
            <group key={`leg${sd}`} position={[0, hipWorldY, 0]}>
              <Limb a={l.H} mid={l.K} b={l.F} w0={7.4} w1={5} z={0.03} hand={5.2} />
              <Limb a={l.F} mid={[(l.F[0] + l.toe[0]) / 2, l.F[1] + 2]} b={l.toe} w0={5} w1={4.4} z={0.03} wob={0} />
            </group>
          );
        })}
        <group position={[0, hipWorldY, 0]} rotation={[0, 0, -lean * D2R]} scale={[1, breath, 1]}>
          {plane(textures.lower, planeCy, 0.02)}
          <Limb a={armL.S} mid={armL.E} b={armL.Wr} w0={7} w1={4.8} z={0.06} hand={11} />
          {plane(textures.torso, planeCy, 0.1)}
          <Limb a={armR.S} mid={armR.E} b={armR.Wr} w0={7} w1={4.8} z={0.17} hand={11} />
          <group position={[0, neckRel, 0.24]} rotation={[0, headYaw - bodyYaw, -tilt * D2R]}>
            {plane(textures.head, planeCy - neckRel, 0)}
          </group>
        </group>
      </group>
    </group>
  );
};
