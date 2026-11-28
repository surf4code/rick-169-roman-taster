import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import catalogData from "../data/catalog1000.json";
import { RICK_WARM_BRIGHT_DAY } from "../utils/colorGrade";
import { SceneLights } from "../components/RomanDioramaStage";
import {
  DadCar3D,
  BusWithInterior3D,
  HorseWithRider3D,
  RiverAndBridge3D,
  House3D,
  Castle3D,
  TableAndProps3D,
  FlowersAndTrees3D,
} from "../components/UniverseProps3D";
import { CastLayer, CastMember } from "../components/CastLayer";
import { Cam } from "../utils/camera";

export const UniverseShowcase: React.FC = () => {
  const cam: Cam = {
    fovDeg: 38,
    pos: [0, 3.4, 11.5],
    look: [0, 0.9, 0],
    rollDeg: 0,
  };
  const castMembers: CastMember[] = [
    { id: "dad", pos: [-3.8, 0, 1.6], emotion: "happy_relief", scale: 1.0 },
    { id: "mustache_protagonist", pos: [-1.4, 0, 1.6], emotion: "skeptical", scale: 1.0 },
    { id: "girl_hero", pos: [1.2, 0, 1.6], emotion: "curious", scale: 0.9 },
    { id: "young_child", pos: [3.6, 0, 1.6], emotion: "happy_relief", scale: 0.7 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: RICK_WARM_BRIGHT_DAY.bgColor }}>
      <ThreeCanvas width={1920} height={1080} shadows camera={{ fov: 38, position: cam.pos, near: 0.05, far: 300 }}>
        <color attach="background" args={[RICK_WARM_BRIGHT_DAY.bgColor]} />
        <SceneLights setId="universe_showcase" grade={RICK_WARM_BRIGHT_DAY} castShadows />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28, 20]} />
          <meshStandardMaterial color="#DFC9A6" roughness={0.82} />
        </mesh>
        <group position={[-4.6, 0, -2.4]} scale={[0.72, 0.72, 0.72]}>
          <Castle3D />
        </group>
        <group position={[-1.4, 0, -2.2]} scale={[0.78, 0.78, 0.78]}>
          <House3D />
        </group>
        <group position={[2.2, 0, -2.0]} scale={[0.55, 0.55, 0.55]}>
          <BusWithInterior3D />
        </group>
        <group position={[5.2, 0, -2.2]} scale={[0.75, 0.75, 0.75]}>
          <DadCar3D />
        </group>
        <group position={[-2.6, 0, -0.3]} scale={[0.78, 0.78, 0.78]}>
          <HorseWithRider3D hasRider />
        </group>
        <group position={[0.4, 0, -0.3]} scale={[0.78, 0.78, 0.78]}>
          <TableAndProps3D />
        </group>
        <group position={[3.6, 0, -0.3]} scale={[0.85, 0.85, 0.85]}>
          <FlowersAndTrees3D />
        </group>
        <group position={[0, 0, 3.4]} scale={[0.75, 0.75, 0.75]}>
          <RiverAndBridge3D />
        </group>
      </ThreeCanvas>
      <CastLayer
        cam={cam}
        width={1920}
        height={1080}
        members={castMembers}
        tint="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
      />
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 36,
          backgroundColor: "#FFFBF2",
          border: "4px solid #161618",
          borderRadius: 14,
          padding: "10px 20px",
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 22,
          color: "#161618",
        }}
      >
        RICK-169 UNIVERSE LIBRARY: {catalogData.totalCount} CODE-BUILT ITEMS
      </div>
    </AbsoluteFill>
  );
};
