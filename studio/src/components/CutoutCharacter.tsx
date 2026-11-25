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
const TEX_SCALE = 3; // texture pixels per svg unit
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
}

/** Pure function: the exact SVG markup for one character on one frame (blink/breath/talk included). */
export function characterMarkup(i: CharacterMarkupInput): string {
  const { characterId, emotion, frame, fps, rmsAmplitude = 0, spectralCentroid = 0.5, stepOnTwos = true } = i;
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

/**
 * Call this in the normal React tree (NOT inside ThreeCanvas). Pass {key: markup}. Returns {key: texture|null}.
 * The frame capture is blocked until every texture is rasterised and two animation frames have passed.
 */
export function useSvgTextures(markups: Record<string, string>): Record<string, THREE.CanvasTexture | null> {
  const signature = JSON.stringify(markups);
  const [state, setState] = useState<{ sig: string; textures: Record<string, THREE.CanvasTexture> } | null>(null);
  const handleFor = useRef<{ sig: string; handle: number } | null>(null);

  if (Object.keys(markups).length > 0 && (!handleFor.current || handleFor.current.sig !== signature)) {
    handleFor.current = { sig: signature, handle: delayRender("character textures") };
  }

  useEffect(() => {
    const mine = handleFor.current;
    if (!mine || mine.sig !== signature) return;
    let cancelled = false;
    let r1 = 0;
    let r2 = 0;
    Promise.all(Object.entries(markups).map(async ([k, m]) => [k, await loadTexture(m)] as const))
      .then((pairs) => {
        if (cancelled) return;
        setState({ sig: signature, textures: Object.fromEntries(pairs) });
        // let React/R3F commit and the WebGL canvas redraw before the capture is released
        r1 = requestAnimationFrame(() => {
          r2 = requestAnimationFrame(() => setTimeout(() => continueRender(mine.handle), 50));
        });
      })
      .catch((e) => {
        continueRender(mine.handle);
        throw e;
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [signature]);

  const out: Record<string, THREE.CanvasTexture | null> = {};
  for (const k of Object.keys(markups)) out[k] = state && state.sig === signature ? state.textures[k] ?? null : null;
  return out;
}

export interface CutoutCharacterProps {
  characterId: CharacterId;
  position: [number, number, number];
  scale?: number;
  texture: THREE.Texture | null;
  flipX?: boolean;
}

/** Draws one pre-rasterised character inside the 3D scene. */
export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({ characterId, position, scale = 1, texture, flipX = false }) => {
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const finalScale = scale * (spec.heightScale ?? 1.0);
  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.56, 28]} />
        <meshBasicMaterial color="#1A203A" transparent opacity={0.32} />
      </mesh>
      {texture && (
        <mesh position={[0, PLANE_CENTER_Y, 0.02]}>
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
