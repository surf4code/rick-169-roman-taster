import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import charactersData from "../data/characters.json";
import fullPlan from "../data/shots_full.json";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { projector, V3 } from "../utils/camera";
import { shotCamera, shotFov } from "../utils/shotCamera";
import { CameraRig3D } from "../components/CameraRig3D";
import { RomanDioramaStage } from "../components/RomanDioramaStage";
import { CastLayer, CastMember, GroundShadows, castHeightM } from "../components/CastLayer";
import { FrontLayer, FrontProp } from "../components/FrontLayer";
import { FloatingRoleTag } from "../components/FloatingRoleTag";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { PostFX } from "../components/PostFX";
import { InfographicCard } from "../components/InfographicCard";
import { AkiraCutaway, AkiraExpression } from "../components/AkiraCutaway";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot: any =
    fullPlan.shots.find((s) => t >= s.start && t < s.end) ||
    fullPlan.shots[fullPlan.shots.length - 1];
  const localT = t - shot.start;
  const dur = shot.end - shot.start;
  const grade = shot.grade === "night_torch" ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;

  if (shot.type === "akira_cutaway") {
    return (
      <AkiraCutaway
        expression={(shot.akiraExpression || "smirk") as AkiraExpression}
        bubbleText={shot.bubble?.text}
      />
    );
  }
  if (shot.type === "infographic_card" && shot.infographic) {
    return <InfographicCard {...shot.infographic} />;
  }

  const cam = shotCamera(shot.camera, localT, dur, shotFov(shot.type));
  const project = projector(cam, width, height);
  const members: CastMember[] = (shot.characters || []).map((c: any) => ({
    id: c.id,
    pos: c.pos as V3,
    scale: c.scale ?? 1,
    emotion: c.emotion,
    flipX: c.flipX ?? false,
  }));
  const frontProps: FrontProp[] = shot.frontProps || [];
  const rms = 0.35 + 0.35 * Math.abs(Math.sin(frame * 0.4));

  let tag: { x: number; y: number; color: string } | null = null;
  if (shot.floatingTag) {
    const target = members.find((m) => m.id === shot.floatingTag.target);
    const p: V3 = target
      ? [target.pos[0], target.pos[1] + castHeightM(target.id, target.scale ?? 1) + 0.22, target.pos[2]]
      : [0, 2.55, 0.2];
    const sp = project(p);
    const spec = target ? (charactersData.cast as Record<string, any>)[target.id] : null;
    if (sp.visible) tag = { x: sp.x, y: sp.y, color: spec?.roleTagColor ?? "#2563EB" };
  }

  return (
    <AbsoluteFill style={{ backgroundColor: grade.bgColor }}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: cam.fov, near: 0.05, far: 300 }}>
          <CameraRig3D cam={cam} />
          <RomanDioramaStage setId={shot.set} grade={grade} />
          <GroundShadows members={members} />
          <AtmosphereFX warmTorch={shot.grade === "night_torch"} />
          <PostFX focusDistance={0.012} bokehScale={shot.type === "macro_prop_insert" ? 3.2 : 1.8} grade={grade} />
        </ThreeCanvas>
      </AbsoluteFill>

      <CastLayer cam={cam} width={width} height={height} members={members} tint={grade.castTint} rmsAmplitude={rms} />

      {frontProps.length > 0 && (
        <FrontLayer cam={cam} width={width} height={height} setId={shot.set} grade={grade} props={frontProps} />
      )}

      {tag && shot.floatingTag && (
        <FloatingRoleTag
          label={shot.floatingTag.text}
          x={tag.x}
          y={tag.y}
          appearFrame={Math.round(shot.start * fps) + 6}
          accentColor={tag.color}
        />
      )}
      {shot.stamp && (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 64,
            color: "#FFFFFF",
            fontSize: 38,
            fontWeight: 900,
            fontStyle: "italic",
            textShadow: "3px 3px 0 #141414, -2px -2px 0 #141414",
            fontFamily: "sans-serif",
          }}
        >
          {shot.stamp}
        </div>
      )}
      {shot.bubble && (
        <div
          style={{
            position: "absolute",
            top: 76,
            right: 88,
            backgroundColor: "#FFFFFF",
            border: "5px solid #141414",
            borderRadius: 40,
            padding: "18px 34px",
            fontSize: 32,
            fontWeight: 900,
            fontStyle: "italic",
            color: "#141414",
            fontFamily: "sans-serif",
          }}
        >
          {shot.bubble.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
