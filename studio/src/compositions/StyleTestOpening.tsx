import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import styleShotPlan from "../data/styleTestShots.json";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { place, easeOut, clamp } from "../utils/anim";
import { cameraFor } from "../utils/cameraModes";
import charactersData from "../data/characters.json";
import { RomanDioramaStage } from "../components/RomanDioramaStage";
import * as P from "../components/props/RomanProps";
import { CollarTag } from "../components/props/CollarTag";
import { CutoutCharacter, CharacterId, characterMarkup, useSvgTextures, LAYERS, restingTurn } from "../components/CutoutCharacter";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { PostFX } from "../components/PostFX";
import { InfographicCard } from "../components/InfographicCard";
import { AkiraCutaway, AkiraExpression } from "../components/AkiraCutaway";
import { RoleTag, Bubble, MikoTag, MikoPlate, projectToScreen } from "../components/Overlays";

const Rig: React.FC<{ mode: string; localT: number; dur: number; focus: [number, number, number] }> = ({ mode, localT, dur, focus }) => {
  const { camera } = useThree();
  const cs = cameraFor(mode, localT, dur, focus);
  (camera as THREE.PerspectiveCamera).fov = cs.fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  place(camera as any, cs.pos, cs.look, cs.roll);
  return null;
};

const HERO: Record<string, React.FC<any>> = { Goblet: P.Goblet, Platter: P.Platter, Jug: P.Jug, Amphora: P.Amphora, Bowl: P.Bowl, CollarTag };

const normalise = (plan: any) => ({
  ...plan,
  shots: plan.shots.map((x: any) => (x.startFrame !== undefined ? { ...x, start: x.startFrame / 30, end: (x.startFrame + x.durFrames) / 30 } : x)),
});

export const StyleTestOpening: React.FC<{ plan?: any }> = ({ plan }) => {
  const shotPlan = React.useMemo(() => normalise(plan || styleShotPlan), [plan]);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot: any = shotPlan.shots.find((s: any) => t >= s.start && t < s.end) || shotPlan.shots[shotPlan.shots.length - 1];
  const localT = t - shot.start;
  const dur = shot.end - shot.start;
  const miko = shotPlan.look === "miko";
  const isNight = shot.grade === "night_torch";
  const grade = isNight ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;

  // Characters are rasterised OUTSIDE the ThreeCanvas so the capture waits for them (see CutoutCharacter.tsx).
  const rms = Math.round((0.35 + 0.35 * Math.abs(Math.sin(Math.floor(frame / 2) * 0.8))) * 4) / 4;
  const isCard = shot.type === "akira_cutaway" || shot.type === "infographic_card";
  // emotion may be a track: [[tSec, emotion], ...] -> expression changes on story beats inside a shot
  const emoInfo = (e: any): { cur: string; prev: string; since: number } => {
    if (!Array.isArray(e)) return { cur: e, prev: e, since: 99 };
    let idx = 0;
    e.forEach(([ts]: [number, string], i: number) => { if (localT >= ts) idx = i; });
    return { cur: e[idx][1], prev: idx > 0 ? e[idx - 1][1] : e[idx][1], since: idx > 0 ? localT - e[idx][0] : 99 };
  };
  const dec = (c: any, bg: boolean) => { const i = emoInfo(c.emotion); return { ...c, bg, emotion: i.cur, prevEmotion: i.prev, sinceT: i.since }; };
  const all: any[] = isCard ? [] : [...(shot.crowd || []).map((c: any) => dec(c, true)), ...(shot.characters || []).map((c: any) => dec(c, false))];
  const markups: Record<string, string> = {};
  all.forEach((c) => {
    const talking = !c.bg && shot.bubble && shot.characters[shot.bubble.who]?.id === c.id;
    c._talking = !!talking;
    c._key = `${c.id}:${c.emotion}:${talking ? 1 : 0}`;
    const turn = restingTurn(c.id);
    LAYERS.forEach((l) => {
      const mk = characterMarkup({ characterId: c.id as CharacterId, emotion: c.emotion, frame, fps, rmsAmplitude: talking ? rms : 0.05, layer: l, turn, look: miko ? "miko" : "rick" });
      markups[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] = mk;
    });
  });
  const textures = useSvgTextures(markups);

  if (shot.type === "akira_cutaway") return <AkiraCutaway expression={(shot.akiraExpression || "smirk") as AkiraExpression} bubbleText={shot.bubble?.text} />;
  if (shot.type === "infographic_card") return <InfographicCard {...shot.infographic} />;

  const focus: [number, number, number] = shot.focus ?? (shot.characters && shot.characters[0] ? [shot.characters[0].pos[0], 0, shot.characters[0].pos[2]] : [0, 0, 0]);
  const cs = cameraFor(shot.camera, localT, dur, focus);
  const headPos = (c: any): [number, number, number] => {
    const spec = (charactersData.cast as Record<string, any>)[c.id];
    return [c.pos[0], 2.15 * (c.scale ?? 1) * (spec?.heightScale ?? 1) + 0.25, c.pos[2]];
  };
  const focusDist = Math.hypot(cs.pos[0] - cs.look[0], cs.pos[1] - cs.look[1], cs.pos[2] - cs.look[2]);
  const macro = shot.camera === "macro_push" || shot.camera === "slowmo_impact" || shot.camera === "insert_macro";
  const cine = !!shot.cine;
  const tight = ["cu_hero", "low_hero", "ecu_face"].includes(shot.camera);

  return (
    <AbsoluteFill style={{ backgroundColor: grade.bgColor }}>
      <ThreeCanvas width={width} height={height} dpr={1.75} gl={{ antialias: true }} shadows camera={{ fov: 38, near: 0.05, far: 80 }}>
        <Rig mode={shot.camera} localT={localT} dur={dur} focus={focus} />
        <RomanDioramaStage setId={shot.set} grade={grade} cine={cine} miko={miko} />
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
          <CutoutCharacter key={`${i}:${c._key}`} characterId={c.id as CharacterId} position={c.pos} scale={c.scale ?? 1} flipX={!!c.flipX} camPos={cs.pos as [number, number, number]} emotion={c.emotion} prevEmotion={c.prevEmotion} sinceT={c.sinceT} focus={!c.bg && shot.characters.length === 1} time={frame / fps} talking={c._talking} textures={Object.fromEntries(LAYERS.map((l) => [l, textures[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] ?? null]))} />
        ))}
        <PostFX focusDistance={0} worldFocus={focusDist} focusRange={miko ? Math.max(0.9, focusDist * 0.4) : shot.camera === "insert_macro" ? 0.45 : tight ? Math.max(0.9, focusDist * 0.42) : undefined} bokehScale={miko ? 3.6 : macro ? 4.6 : tight ? 4.2 : 1.8} grade={grade} />
      </ThreeCanvas>

      {(shot.tags || []).map((tg: any, i: number) => {
        const c = shot.characters[tg.who];
        if (!c) return null;
        const sp = projectToScreen(headPos(c), cs);
        if (miko) return <MikoTag key={i} x={sp.x} y={sp.y} text={tg.text} color={tg.color} frame={frame} appearFrame={Math.round((shot.start + tg.at) * fps)} fps={fps} />;
        return <RoleTag key={i} x={sp.x} y={sp.y} text={tg.text} color={tg.color} frame={frame} appearFrame={Math.round((shot.start + tg.at) * fps)} fps={fps} />;
      })}
      {shot.bubble && (() => {
        const c = shot.characters[shot.bubble.who];
        const sp = projectToScreen(headPos(c), cs);
        return <Bubble x={sp.x} y={sp.y} text={shot.bubble.text} frame={frame} appearFrame={Math.round((shot.start + (shot.bubble.at ?? 0.3)) * fps)} fps={fps} />;
      })()}
      {miko && (shot.plates || []).map((pl: any, i: number) => (
        <MikoPlate key={i} text={pl.text} sub={pl.sub} frame={frame} appearFrame={Math.round((shot.start + pl.at) * fps)} fps={fps} fadeOutAt={Math.round((shot.end - 0.35) * fps)} />
      ))}
      {miko && (() => {
        // soft dip to warm cream at shot boundaries instead of a hard cut
        const D = 0.3;
        const idx = shotPlan.shots.indexOf(shot);
        const inA = idx > 0 ? 1 - clamp(localT / D) : 0;
        const outA = idx < shotPlan.shots.length - 1 ? clamp((localT - (dur - D)) / D) : 0;
        const a = Math.max(inA, outA);
        return a > 0 ? <AbsoluteFill style={{ backgroundColor: "#F6E8CC", opacity: a }} /> : null;
      })()}
      {!miko && shot.stamp && (
        <div style={{ position: "absolute", top: 44, left: 64, color: "#FFFFFF", fontSize: 40, fontWeight: 900, fontStyle: "italic", textShadow: "3px 3px 0 #141414, -2px -2px 0 #141414, 2px -2px 0 #141414, -2px 2px 0 #141414", fontFamily: "'Arial Black', Arial, sans-serif" }}>
          {shot.stamp}
        </div>
      )}
    </AbsoluteFill>
  );
};
