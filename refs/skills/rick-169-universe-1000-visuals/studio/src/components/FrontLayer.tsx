// Optional FRONT layer: a second transparent ThreeCanvas with the same camera
// and lights, composited ABOVE the 2D cast. Use it for foreground props that
// must overlap characters (table edges, amphorae, columns near the lens).
// Only mounted when a shot lists frontProps (costs a second WebGL pass).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Cam, V3 } from "../utils/camera";
import { GradePreset } from "../utils/colorGrade";
import { CameraRig3D } from "./CameraRig3D";
import { SceneLights } from "./RomanDioramaStage";

export interface FrontProp {
  kind: "amphora" | "column";
  pos: V3;
  scale?: number;
  rotY?: number;
}

const Amphora: React.FC<{ color?: string }> = ({ color = "#B8613A" }) => {
  const geo = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.07, 0.0], [0.12, 0.06], [0.2, 0.2], [0.24, 0.36], [0.22, 0.52],
      [0.14, 0.64], [0.08, 0.7], [0.07, 0.8], [0.1, 0.84], [0.09, 0.86], [0.0, 0.86],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 28);
  }, []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.13, 0.71, 0]} rotation={[0, 0, s * 0.35]}>
          <torusGeometry args={[0.06, 0.016, 8, 16, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
};

const Column: React.FC = () => (
  <group>
    <mesh position={[0, 1.6, 0]}>
      <cylinderGeometry args={[0.26, 0.3, 3.2, 20]} />
      <meshStandardMaterial color="#FAF5EB" roughness={0.65} />
    </mesh>
    <mesh position={[0, 0.08, 0]}>
      <boxGeometry args={[0.75, 0.16, 0.75]} />
      <meshStandardMaterial color="#EFE6D2" roughness={0.7} />
    </mesh>
  </group>
);

export const FrontLayer: React.FC<{
  cam: Cam;
  width: number;
  height: number;
  setId: string;
  grade: GradePreset;
  props: FrontProp[];
}> = ({ cam, width, height, setId, grade, props }) => (
  <AbsoluteFill>
    <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }}>
      <CameraRig3D cam={cam} />
      <SceneLights setId={setId} grade={grade} />
      {props.map((p, i) => (
        <group key={`${p.kind}-${i}`} position={p.pos} rotation={[0, p.rotY ?? 0, 0]} scale={p.scale ?? 1}>
          {p.kind === "amphora" ? <Amphora /> : <Column />}
        </group>
      ))}
    </ThreeCanvas>
  </AbsoluteFill>
);
