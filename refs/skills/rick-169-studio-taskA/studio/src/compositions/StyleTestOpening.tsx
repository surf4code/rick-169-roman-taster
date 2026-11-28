import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import shotPlan from "../data/styleTestShots.json";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { kfVec3, easeOut, place, shake, slowMoTime } from "../utils/anim";
import { RomanDioramaStage } from "../components/RomanDioramaStage";
import { CutoutCharacter, CharacterId } from "../components/CutoutCharacter";
import { FloatingRoleTag } from "../components/FloatingRoleTag";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { PostFX } from "../components/PostFX";
import { InfographicCard } from "../components/InfographicCard";
import { AkiraCutaway, AkiraExpression } from "../components/AkiraCutaway";

const CameraRig: React.FC<{ cameraMode: string; localT: number; dur: number }> = ({ cameraMode, localT, dur }) => {
  const { camera } = useThree();
  const u = Math.min(1, Math.max(0, localT / Math.max(dur, 0.1)));
  let pos: [number, number, number] = [0, 1.5, 5.2];
  let look: [number, number, number] = [0, 1.2, 0];
  let roll = 0;

  if (cameraMode === "slow_push") {
    pos = kfVec3(u, [[0, [0, 1.55, 5.6]], [1, [0, 1.48, 4.7]]]);
  } else if (cameraMode === "punch_in") {
    pos = kfVec3(u, [[0, [0, 1.5, 4.2]], [0.35, [0, 1.48, 2.9]], [1, [0, 1.48, 2.75]]], easeOut);
  } else if (cameraMode === "low_angle_tilt") {
    pos = kfVec3(u, [[0, [0.3, 0.65, 3.8]], [1, [-0.2, 0.72, 3.2]]]);
    look = [0, 1.65, -0.4];
  } else if (cameraMode === "top_down_drift") {
    pos = kfVec3(u, [[0, [-0.6, 6.2, 2.6]], [1, [0.6, 5.8, 2.2]]]);
    look = [0, 0.4, -0.5];
  } else if (cameraMode === "macro_push" || cameraMode === "slowmo_impact") {
    const tEff = cameraMode === "slowmo_impact" ? slowMoTime(localT, 0.6, 2.4, 0.25) / Math.max(dur, 0.1) : u;
    pos = kfVec3(tEff, [[0, [0.25, 1.35, 0.4]], [1, [0.05, 1.15, -0.25]]], easeOut);
    look = [0, 1.05, -1.2];
    if (cameraMode === "slowmo_impact") {
      const sh = shake(localT, 2.2, 7);
      pos = [pos[0] + sh[0], pos[1] + sh[1], pos[2] + sh[2]];
    }
  } else if (cameraMode === "whip_right") {
    pos = kfVec3(u, [[0, [-1.4, 1.5, 4.2]], [0.25, [0.9, 1.5, 3.9]], [1, [1.0, 1.5, 3.8]]], easeOut);
    look = [0.6, 1.3, 0];
  } else if (cameraMode === "fly_through") {
    pos = kfVec3(u, [[0, [0, 1.6, 6.8]], [1, [0, 1.4, 2.6]]]);
  }

  place(camera as any, pos, look, roll);
  return null;
};

export const StyleTestOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot: any = shotPlan.shots.find((s) => t >= s.start && t < s.end) || shotPlan.shots[shotPlan.shots.length - 1];
  const localT = t - shot.start;
  const dur = shot.end - shot.start;
  const grade = shot.grade === "night_torch" ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;

  if (shot.type === "akira_cutaway") {
    return <AkiraCutaway expression={(shot.akiraExpression || "smirk") as AkiraExpression} bubbleText={shot.bubble?.text} />;
  }
  if (shot.type === "infographic_card" && shot.infographic) {
    return <InfographicCard {...shot.infographic} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: grade.bgColor }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: shot.type === "macro_prop_insert" ? 26 : 38, near: 0.05, far: 300 }}>
        <CameraRig cameraMode={shot.camera} localT={localT} dur={dur} />
        <RomanDioramaStage setId={shot.set} grade={grade} />
        <AtmosphereFX warmTorch={shot.grade === "night_torch"} />
        {(shot.characters || []).map((c: any) => (
          <CutoutCharacter
            key={c.id}
            characterId={c.id as CharacterId}
            position={c.pos}
            scale={c.scale ?? 1}
            emotion={c.emotion}
            rmsAmplitude={0.35 + 0.35 * Math.abs(Math.sin(frame * 0.4))}
          />
        ))}
        {shot.floatingTag && (
          <FloatingRoleTag label={shot.floatingTag.text} position={[0, 2.55, 0.2]} appearFrame={Math.round(shot.start * fps) + 6} />
        )}
        <PostFX focusDistance={0.012} bokehScale={shot.type === "macro_prop_insert" ? 3.2 : 1.8} grade={grade} />
      </ThreeCanvas>

      {shot.stamp && (
        <div style={{
          position: "absolute", top: 44, left: 64, color: "#FFFFFF", fontSize: 38, fontWeight: 900,
          fontStyle: "italic", textShadow: "3px 3px 0 #141414, -2px -2px 0 #141414", fontFamily: "sans-serif"
        }}>
          {shot.stamp}
        </div>
      )}
      {shot.bubble && (
        <div style={{
          position: "absolute", top: 76, right: 88, backgroundColor: "#FFFFFF", border: "5px solid #141414",
          borderRadius: 40, padding: "18px 34px", fontSize: 32, fontWeight: 900, fontStyle: "italic",
          color: "#141414", fontFamily: "sans-serif"
        }}>
          {shot.bubble.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
