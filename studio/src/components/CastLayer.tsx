// 2D cast composited over the 3D world (3d-stickman approach).
// Each character is a flat SVG rig whose FEET are pinned to the screen
// projection of its 3D ground point, computed with the same Cam that drives
// the ThreeCanvas. Scale = billboard pixels-per-metre at that depth.
// Replaces CutoutCharacter (drei <Html>), which Remotion's capture never drew.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import charactersData from "../data/characters.json";
import { EmotionName } from "../utils/emotions";
import { mulberry32 } from "../utils/anim";
import { Cam, ScreenPoint, V3, distanceFrom, projector } from "../utils/camera";
import { CharacterId, CharacterSvg } from "./CharacterSvg";

// Rig geometry inside CharacterSvg's 280x400 viewBox: feet line and head-top.
export const RIG_FEET_X = 140;
export const RIG_FEET_Y = 364; // 228 (body origin) + 136 (feet)
export const RIG_HEIGHT_UNITS = 271; // feet (364) to head top (93)

export interface CastMember {
  id: string;
  pos: V3; // ground point (feet) in world metres
  scale?: number; // 1 = adult; 0.65 = child, etc.
  emotion: EmotionName;
  flipX?: boolean;
}

const castSpec = (id: string): Record<string, any> =>
  (charactersData.cast as Record<string, any>)[id] ?? charactersData.cast.taster_protagonist;

export const castHeightM = (id: string, scale = 1) =>
  charactersData.defaults.baseHeightM * (castSpec(id).heightScale ?? 1) * scale;

const hashSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const ProjectedCharacter: React.FC<{ member: CastMember; sp: ScreenPoint; rmsAmplitude: number }> = ({
  member,
  sp,
  rmsAmplitude,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charFrame = Math.floor(rawFrame / 2) * 2; // animate on twos
  const seed = useMemo(() => hashSeed(member.id), [member.id]);

  const cycleLen = Math.floor(fps * 3.1);
  const rng = mulberry32(seed + Math.floor(charFrame / cycleLen));
  const blinkStart = Math.floor(rng() * (fps * 2.4));
  const localF = charFrame % cycleLen;
  const isBlinking = localF >= blinkStart && localF <= blinkStart + 3;

  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 2.5;
  const talkNod = rmsAmplitude > 0.18 ? Math.sin(charFrame * 0.65) * 3.2 * rmsAmplitude : 0;

  const s = (castHeightM(member.id, member.scale ?? 1) * sp.ppm) / RIG_HEIGHT_UNITS;
  // Follow camera roll / converging verticals a little, never lie a figure down.
  const roll = Math.abs(sp.roll) > 90 ? 0 : Math.max(-12, Math.min(12, sp.roll));
  const fx = member.flipX ? -1 : 1;

  return (
    <g transform={`translate(${sp.x} ${sp.y}) rotate(${roll}) scale(${s * fx} ${s}) translate(${-RIG_FEET_X} ${-RIG_FEET_Y})`}>
      <CharacterSvg
        characterId={member.id as CharacterId}
        emotion={member.emotion}
        rmsAmplitude={rmsAmplitude}
        isBlinking={isBlinking}
        breathY={breathY}
        talkNod={talkNod}
        width={280}
        height={400}
        uid={`${member.id}-cast`}
      />
    </g>
  );
};

export const CastLayer: React.FC<{
  cam: Cam;
  width: number;
  height: number;
  members: CastMember[];
  tint: string;
  rmsAmplitude?: number;
  debugProjection?: boolean;
}> = ({ cam, width, height, members, tint, rmsAmplitude = 0, debugProjection = false }) => {
  const project = projector(cam, width, height);
  const placed = members
    .map((m) => ({ m, sp: project(m.pos), d: distanceFrom(cam, m.pos) }))
    .filter((p) => p.sp.visible)
    .sort((a, b) => b.d - a.d); // far first, near last

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="rick169-scenelight" filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={tint} />
        </filter>
      </defs>
      <g filter="url(#rick169-scenelight)">
        {placed.map(({ m, sp }) => (
          <ProjectedCharacter key={m.id} member={m} sp={sp} rmsAmplitude={rmsAmplitude} />
        ))}
      </g>
      {debugProjection &&
        placed.map(({ m, sp }) => {
          const head = project([m.pos[0], m.pos[1] + castHeightM(m.id, m.scale ?? 1), m.pos[2]]);
          return (
            <g key={`dbg-${m.id}`} stroke="#00E5FF" strokeWidth={3} fill="none">
              <circle cx={sp.x} cy={sp.y} r={14} />
              <line x1={sp.x - 26} y1={sp.y} x2={sp.x + 26} y2={sp.y} />
              <line x1={sp.x} y1={sp.y - 26} x2={sp.x} y2={sp.y + 26} />
              <circle cx={head.x} cy={head.y} r={9} />
              <text x={sp.x + 20} y={sp.y + 40} fill="#00E5FF" stroke="none" fontSize={22} fontFamily="monospace">
                {`${m.id} ppm=${sp.ppm.toFixed(0)}`}
              </text>
            </g>
          );
        })}
    </svg>
  );
};

// Soft violet contact shadows, rendered INSIDE the 3D scene so they sit on the
// real floor, get perspective for free and receive the canvas post-FX.
export const GroundShadows: React.FC<{
  members: CastMember[];
  color?: string;
  opacity?: number;
  debugProjection?: boolean;
}> = ({ members, color = "#2B1F48", opacity = 0.42, debugProjection = false }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.7)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  return (
    <group>
      {members.map((m) => {
        const k = castHeightM(m.id, m.scale ?? 1) / charactersData.defaults.baseHeightM;
        const r = charactersData.defaults.shadowRadiusM * k;
        return (
          <group key={`sh-${m.id}`} position={[m.pos[0], m.pos[1] + 0.012, m.pos[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
              <planeGeometry args={[r * 2.6, r * 1.7]} />
              <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
            </mesh>
            {debugProjection && (
              <>
                <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
                  <ringGeometry args={[0.07, 0.11, 32]} />
                  <meshBasicMaterial color="#FF00C8" depthTest={false} toneMapped={false} />
                </mesh>
                <mesh position={[0, castHeightM(m.id, m.scale ?? 1), 0]} renderOrder={2}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#FF00C8" depthTest={false} toneMapped={false} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};
