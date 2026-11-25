import React, { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { continueRender, delayRender } from "remotion";
import charactersData from "../data/characters.json";
import { EmotionName } from "../utils/emotions";
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
const TEX_SCALE = 2.4; // texture pixels per svg unit
const WORLD_PER_UNIT = 2.0 / 278;
const FEET_SVG_Y = 364;
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
  layer?: "all" | "lower" | "armB" | "torso" | "armF" | "head";
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
      tex.anisotropy = 4;
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

export const LAYERS = ["lower", "armB", "torso", "armF", "head"] as const;
export type LayerName = (typeof LAYERS)[number];
const LAYER_Z: Record<LayerName, number> = { lower: 0.0, armB: 0.05, torso: 0.1, armF: 0.17, head: 0.24 };
/** Resting 3/4 turn per character (never dead-front), sign + size seeded by id. */
export function restingTurn(id: string): number {
  let h = 7;
  for (let k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
  return (h % 2 ? 1 : -1) * (0.18 + ((h >>> 3) % 5) * 0.04);
}

export interface CutoutCharacterProps {
  characterId: CharacterId;
  position: [number, number, number];
  scale?: number;
  textures: Partial<Record<LayerName, THREE.Texture | null>>;
  flipX?: boolean;
  camPos?: [number, number, number];
  lookAt?: [number, number, number];
}

/** Draws one character as 5 depth-separated layers (legs/back arm/torso/front arm/head) -> real 2.5D parallax. */
export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({ characterId, position, scale = 1, textures, flipX = false, camPos, lookAt }) => {
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const finalScale = scale * (spec.heightScale ?? 1.0);
  const toward = (t?: [number, number, number]) => (t ? Math.atan2(t[0] - position[0], t[2] - position[2]) : 0);
  const clampA = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const bodyYaw = camPos ? clampA(toward(camPos) * 0.5, 0.5) : 0;
  const headYaw = bodyYaw + (lookAt ? clampA(toward(lookAt) - toward(camPos), 0.35) * 0.4 : 0) + restingTurn(characterId) * 0.25;
  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.56, 28]} />
        <meshBasicMaterial color="#1A203A" transparent opacity={0.32} />
      </mesh>
      <group rotation={[0, bodyYaw, 0]}>
        {LAYERS.map((l) => {
          const tex = textures[l];
          if (!tex) return null;
          return (
            <group key={l} rotation={[0, l === "head" ? headYaw - bodyYaw : 0, 0]}>
              <mesh position={[0, PLANE_CENTER_Y, 0.02 + LAYER_Z[l]]}>
                <planeGeometry args={[PLANE_W, PLANE_H]} />
                <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};
