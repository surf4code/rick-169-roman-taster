import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import shotPlan from "../data/styleTestShots.json";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { place, easeOut, clamp } from "../utils/anim";
import { cameraFor } from "../utils/cameraModes";
import charactersData from "../data/characters.json";
import { RomanDioramaStage } from "../components/RomanDioramaStage";
import * as P from "../components/props/RomanProps";
import { CutoutCharacter, CharacterId, characterMarkup, useSvgTextures, LAYERS, restingTurn } from "../components/CutoutCharacter";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { PostFX } from "../components/PostFX";
import { InfographicCard } from "../components/InfographicCard";
import { AkiraCutaway, AkiraExpression } from "../components/AkiraCutaway";
import { RoleTag, Bubble, projectToScreen } from "../components/Overlays";

const Rig: React.FC<{ mode: string; localT: number; dur: number }> = ({ mode, localT, dur }) => {
  const { camera } = useThree();
  const cs = cameraFor(mode, localT, dur);
  (camera as THREE.PerspectiveCamera).fov = cs.fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  place(camera as any, cs.pos, cs.look, cs.roll);
  return null;
};

const HERO: Record<string, React.FC<any>> = { Goblet: P.Goblet, Platter: P.Platter, Jug: P.Jug, Amphora: P.Amphora, Bowl: P.Bowl };

export const StyleTestOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot: any = shotPlan.shots.find((s) => t >= s.start && t < s.end) || shotPlan.shots[shotPlan.shots.length - 1];
  const localT = t - shot.start;
  const dur = shot.end - shot.start;
  const isNight = shot.grade === "night_torch";
  const grade = isNight ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;

  // Characters are rasterised OUTSIDE the ThreeCanvas so the capture waits for them (see CutoutCharacter.tsx).
  const rms = Math.round((0.35 + 0.35 * Math.abs(Math.sin(Math.floor(frame / 2) * 0.8))) * 4) / 4;
  const isCard = shot.type === "akira_cutaway" || shot.type === "infographic_card";
  // emotion may be a track: [[tSec, emotion], ...] -> expression changes on story beats inside a shot
  const emoAt = (e: any): string => (Array.isArray(e) ? [...e].reverse().find(([ts]: [number, string]) => localT >= ts)?.[1] ?? e[0][1] : e);
  const all: any[] = isCard ? [] : [...(shot.crowd || []).map((c: any) => ({ ...c, bg: true, emotion: emoAt(c.emotion) })), ...(shot.characters || []).map((c: any) => ({ ...c, emotion: emoAt(c.emotion) }))];
  const markups: Record<string, string> = {};
  all.forEach((c) => {
    const talking = !c.bg && shot.bubble && shot.characters[shot.bubble.who]?.id === c.id;
    c._talking = !!talking;
    c._key = `${c.id}:${c.emotion}:${talking ? 1 : 0}`;
    const turn = restingTurn(c.id);
    LAYERS.forEach((l) => {
      const mk = characterMarkup({ characterId: c.id as CharacterId, emotion: c.emotion, frame, fps, rmsAmplitude: talking ? rms : 0.05, layer: l, turn });
      markups[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] = mk;
    });
  });
  const textures = useSvgTextures(markups);

  if (shot.type === "akira_cutaway") return <AkiraCutaway expression={(shot.akiraExpression || "smirk") as AkiraExpression} bubbleText={shot.bubble?.text} />;
  if (shot.type === "infographic_card") return <InfographicCard {...shot.infographic} />;

  const cs = cameraFor(shot.camera, localT, dur);
  const headPos = (c: any): [number, number, number] => {
    const spec = (charactersData.cast as Record<string, any>)[c.id];
    return [c.pos[0], 2.15 * (c.scale ?? 1) * (spec?.heightScale ?? 1) + 0.25, c.pos[2]];
  };
  const focusDist = Math.hypot(cs.pos[0] - cs.look[0], cs.pos[1] - cs.look[1], cs.pos[2] - cs.look[2]);
  const macro = shot.camera === "macro_push" || shot.camera === "slowmo_impact";

  return (
    <AbsoluteFill style={{ backgroundColor: grade.bgColor }}>
      <ThreeCanvas width={width} height={height} dpr={1.75} gl={{ antialias: true }} shadows camera={{ fov: 38, near: 0.05, far: 80 }}>
        <Rig mode={shot.camera} localT={localT} dur={dur} />
        <RomanDioramaStage setId={shot.set} grade={grade} />
        <AtmosphereFX warmTorch={isNight} />
        {(shot.hero || []).map((h: any, i: number) => {
          const C = HERO[h.t];
          if (!C) return null;
          const tip = h.anim === "tip" ? easeOut(clamp((localT - 1.0) / 1.2)) : 0;
          const pos: [number, number, number] = [h.p[0] + tip * 0.35, h.p[1] - tip * 0.0, h.p[2]];
          const rot: [number, number, number] = [0, 0, -tip * 1.45];
          return <C key={i} position={pos} rotation={rot} scale={h.s ?? 1} {...(h.o || {})} />;
        })}
        {all.map((c: any, i: number) => (
          <CutoutCharacter key={`${i}:${c._key}`} characterId={c.id as CharacterId} position={c.pos} scale={c.scale ?? 1} flipX={!!c.flipX} camPos={cs.pos as [number, number, number]} emotion={c.emotion} time={frame / fps} talking={c._talking} textures={Object.fromEntries(LAYERS.map((l) => [l, textures[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] ?? null]))} />
        ))}
        <PostFX focusDistance={0} worldFocus={focusDist} bokehScale={macro ? 3.4 : 1.6} grade={grade} />
      </ThreeCanvas>

      {(shot.tags || []).map((tg: any, i: number) => {
        const c = shot.characters[tg.who];
        if (!c) return null;
        const sp = projectToScreen(headPos(c), cs);
        return <RoleTag key={i} x={sp.x} y={sp.y} text={tg.text} color={tg.color} frame={frame} appearFrame={Math.round((shot.start + tg.at) * fps)} fps={fps} />;
      })}
      {shot.bubble && (() => {
        const c = shot.characters[shot.bubble.who];
        const sp = projectToScreen(headPos(c), cs);
        return <Bubble x={sp.x} y={sp.y} text={shot.bubble.text} frame={frame} appearFrame={Math.round((shot.start + (shot.bubble.at ?? 0.3)) * fps)} fps={fps} />;
      })()}
      {shot.stamp && (
        <div style={{ position: "absolute", top: 44, left: 64, color: "#FFFFFF", fontSize: 40, fontWeight: 900, fontStyle: "italic", textShadow: "3px 3px 0 #141414, -2px -2px 0 #141414, 2px -2px 0 #141414, -2px 2px 0 #141414", fontFamily: "'Arial Black', Arial, sans-serif" }}>
          {shot.stamp}
        </div>
      )}
    </AbsoluteFill>
  );
};
