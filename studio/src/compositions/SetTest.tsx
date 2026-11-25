import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RICK_WARM_BRIGHT_DAY, RICK_WARM_TORCH_NIGHT } from "../utils/colorGrade";
import { place } from "../utils/anim";
import { cameraFor } from "../utils/cameraModes";
import { RomanDioramaStage } from "../components/RomanDioramaStage";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { PostFX } from "../components/PostFX";

const Rig: React.FC<{ mode: string; t: number }> = ({ mode, t }) => {
  const { camera } = useThree();
  const cs = cameraFor(mode, t, 3);
  (camera as THREE.PerspectiveCamera).fov = cs.fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  place(camera as any, cs.pos, cs.look, cs.roll);
  return null;
};

/** Set-only test (no characters): npx remotion still ... SetTest --props='{"setId":"banquet_hall_day","camera":"slow_push","t":0.5}' */
export const SetTest: React.FC<{ setId: string; camera: string; t: number }> = ({ setId, camera, t }) => {
  const { width, height } = useVideoConfig();
  const grade = setId.includes("night") ? RICK_WARM_TORCH_NIGHT : RICK_WARM_BRIGHT_DAY;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 38, near: 0.05, far: 80 }}>
        <Rig mode={camera} t={t} />
        <RomanDioramaStage setId={setId} grade={grade} />
        <AtmosphereFX warmTorch={setId.includes("night")} />
        <PostFX focusDistance={0.05} bokehScale={1.5} grade={grade} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
