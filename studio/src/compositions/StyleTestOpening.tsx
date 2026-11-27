import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import styleShotPlan from "../data/styleTestShots.json";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { place, easeOut, clamp } from "../utils/anim";
import { cameraFor, customCamera } from "../utils/cameraModes";
import { BabyProp, babyMarkup } from "../components/props/Baby";
import { Char3D } from "../components/char3d/Char3D";
import { Baby3D } from "../components/props/Baby3D";
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

const Rig: React.FC<{ cs: any }> = ({ cs }) => {
  const { camera } = useThree();
  (camera as THREE.PerspectiveCamera).fov = cs.fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  place(camera as any, cs.pos, cs.look, cs.roll);
  return null;
};

const HERO: Record<string, React.FC<any>> = { Goblet: P.Goblet, Platter: P.Platter, Jug: P.Jug, Amphora: P.Amphora, Bowl: P.Bowl, Cushion: P.Cushion, CollarTag };

/** Miko moody lighting translated to the Rick warm palette. */
const MIKO_MOOD = {
  ambientIntensity: 0.1, hemiSkyColor: "#8C73B0", hemiGroundColor: "#2E1A22", hemiIntensity: 0.22,
  keyLightColor: "#FFB36E", keyLightIntensity: 1.35, rimLightColor: "#8F86E6", rimLightIntensity: 0.8,
  vignetteDarkness: 0.72, bloomThreshold: 0.84, bloomIntensity: 0.3, bgColor: "#2C1A26",
};
const smooth01 = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

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
  const baseGrade = isNight ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;
  // miko mood: a bit more contrast (lower fill, stronger key, deeper vignette) so characters separate from the set
  const grade = miko ? { ...baseGrade, ...MIKO_MOOD } : baseGrade; // Miko-like moody light: dim fill, one warm key, cool rim, deep vignette (true blacks), Rick warm palette

  // Characters are rasterised OUTSIDE the ThreeCanvas so the capture waits for them (see CutoutCharacter.tsx).
  const rms = Math.round((0.35 + 0.35 * Math.abs(Math.sin(Math.floor(t * 15) * 0.8))) * 4) / 4;
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
    const rest = restingTurn(c.id);
    const orb = shot.cam?.orbit ?? 0;
    const u0 = localT / Math.max(dur, 0.1);
    // face + eyes + mouth slide toward the side the camera is drifting to (Miko's head-turn / immersive 3D feel), quantised to 1/16 for texture caching
    const raw = orb ? rest * 0.5 + Math.sign(orb) * (c.bg ? 0.3 : 0.62) * smooth01((u0 - 0.1) / 0.55) : rest + 0.1 * Math.sin(t * 0.55 + c.id.length);
    const turn = miko ? Math.max(-0.8, Math.min(0.8, raw)) : Math.round(Math.max(-0.8, Math.min(0.8, raw)) * 16) / 16;
    c._turn = turn;
    if (miko) { markups[`${c.id}|torsoTex`] = characterMarkup({ characterId: c.id as CharacterId, emotion: "neutral", frame: 0, fps, layer: "torsoTex" as any, look: "miko", collar: false, stepOnTwos: false }); return; }
    LAYERS.forEach((l) => {
      const mk = characterMarkup({ characterId: c.id as CharacterId, emotion: c.emotion, frame, fps, rmsAmplitude: talking ? rms : 0.05, layer: l, turn, look: miko ? "miko" : "rick", collar: !!c.collar, stepOnTwos: false });
      markups[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] = mk;
    });
  });
  const babyOn = !!shot.baby;
  if (babyOn && !miko) {
    const blinkB = (t % 3.4) > 3.15;
    markups["baby"] = babyMarkup(blinkB, shot.baby.wrap, shot.baby.band);
  }
  const textures = useSvgTextures(markups);

  if (shot.type === "akira_cutaway") return <AkiraCutaway expression={(shot.akiraExpression || "smirk") as AkiraExpression} bubbleText={shot.bubble?.text} />;
  if (shot.type === "infographic_card") return <InfographicCard {...shot.infographic} />;

  const focus: [number, number, number] = shot.focus ?? (shot.characters && shot.characters[0] ? [shot.characters[0].pos[0], 0, shot.characters[0].pos[2]] : [0, 0, 0]);
  const cs = shot.cam ? customCamera(shot.cam, Math.min(1, Math.max(0, localT / Math.max(dur, 0.1)))) : cameraFor(shot.camera, localT, dur, focus);
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
        <Rig cs={cs} />
        <RomanDioramaStage setId={shot.set} grade={grade} cine={cine} miko={miko} focus={focus} />
        <AtmosphereFX warmTorch={isNight} count={miko ? 0 : 12} />
        {(shot.hero || []).map((h: any, i: number) => {
          const C = HERO[h.t];
          if (!C) return null;
          const tip = h.anim === "tip" ? easeOut(clamp((localT - 1.0) / 1.2)) : 0;
          const pos: [number, number, number] = [h.p[0] + tip * 0.35, h.p[1] - tip * 0.0, h.p[2]];
          const rot: [number, number, number] = [0, 0, -tip * 1.45];
          return <C key={i} position={pos} rotation={rot} scale={h.s ?? 1} {...(h.o || {})} />;
        })}
        {babyOn && miko && <Baby3D position={shot.baby.p} scale={shot.baby.s ?? 0.55} time={frame / fps} rock={shot.baby.rock ?? 1} wrap={shot.baby.wrap} band={shot.baby.band} />}
        {babyOn && !miko && <BabyProp tex={textures["baby"] ?? null} position={shot.baby.p} scale={shot.baby.s ?? 0.55} time={frame / fps} rock={shot.baby.rock ?? 1} />}
        {miko && all.map((c: any, i: number) => (
          <Char3D key={`${i}:${c.id}`} characterId={c.id} position={c.pos} scale={c.scale ?? 1} flipX={!!c.flipX} camPos={cs.pos as [number, number, number]} emotion={c.emotion} prevEmotion={c.prevEmotion} sinceT={c.sinceT} time={frame / fps} turn={c._turn} talking={c._talking} collar={!!c.collar} torsoTex={textures[`${c.id}|torsoTex`] ?? null} bg={c.bg} />
        ))}
        {!miko && all.map((c: any, i: number) => (
          <CutoutCharacter key={`${i}:${c._key}`} characterId={c.id as CharacterId} position={c.pos} scale={c.scale ?? 1} flipX={!!c.flipX} camPos={cs.pos as [number, number, number]} emotion={c.emotion} prevEmotion={c.prevEmotion} sinceT={c.sinceT} focus={!c.bg && shot.characters.length === 1} time={frame / fps} look={miko ? "miko" : "rick"} turn={miko ? c._turn : undefined} tone={miko ? "#EDE4EA" : undefined} talking={c._talking} textures={Object.fromEntries(LAYERS.map((l) => [l, textures[l === "head" ? `${c._key}|head` : `${c.id}|${l}`] ?? null]))} />
        ))}
        <PostFX focusDistance={0} worldFocus={focusDist} blurHeight={miko ? 1080 : 360} focusRange={miko ? Math.max(2.0, focusDist * 0.62) : shot.camera === "insert_macro" ? 0.45 : tight ? Math.max(0.9, focusDist * 0.42) : undefined} bokehScale={miko ? 2.6 : macro ? 4.6 : tight ? 4.2 : 1.8} grade={grade} />
      </ThreeCanvas>

      {(shot.tags || []).map((tg: any, i: number) => {
        const c = shot.characters[tg.who];
        if (!c && !tg.pos) return null;
        const sp = projectToScreen(tg.pos ?? headPos(c), cs);
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
        // plain dip-to-black fade at shot boundaries (no white flash)
        const D = 0.2;
        const idx = shotPlan.shots.indexOf(shot);
        const inA = idx > 0 ? 1 - clamp(localT / D) : 0;
        const outA = idx < shotPlan.shots.length - 1 ? clamp((localT - (dur - D)) / D) : 0;
        const a = Math.max(inA, outA);
        return a > 0 ? <AbsoluteFill style={{ backgroundColor: "#07040A", opacity: a * a * (3 - 2 * a) }} /> : null;
      })()}
      {!miko && shot.stamp && (
        <div style={{ position: "absolute", top: 44, left: 64, color: "#FFFFFF", fontSize: 40, fontWeight: 900, fontStyle: "italic", textShadow: "3px 3px 0 #141414, -2px -2px 0 #141414, 2px -2px 0 #141414, -2px 2px 0 #141414", fontFamily: "'Arial Black', Arial, sans-serif" }}>
          {shot.stamp}
        </div>
      )}
    </AbsoluteFill>
  );
};
