import React from "react";
import { RoundedBox, Edges } from "@react-three/drei";
import { GradePreset } from "../utils/colorGrade";
import {
  House3D,
  Castle3D,
  RiverAndBridge3D,
  TableAndProps3D,
  FlowersAndTrees3D,
  DadCar3D,
  BusWithInterior3D,
  HorseWithRider3D,
} from "./UniverseProps3D";

export const SceneLights: React.FC<{ setId: string; grade: GradePreset; castShadows?: boolean }> = ({
  setId,
  grade,
  castShadows = false,
}) => {
  const isNight = setId.includes("night");
  return (
    <>
      <ambientLight intensity={grade.ambientIntensity} />
      <hemisphereLight args={[grade.hemiSkyColor, grade.hemiGroundColor, grade.hemiIntensity]} />
      <directionalLight
        position={[4.5, 7.0, 4.2]}
        intensity={grade.keyLightIntensity}
        color={grade.keyLightColor}
        castShadow={castShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4.5, 3.8, -2.5]} intensity={grade.rimLightIntensity} color={grade.rimLightColor} />
      {isNight && <pointLight position={[0, 2.8, 0.5]} intensity={3.2} distance={10} color="#FFAE52" />}
    </>
  );
};

export const RomanDioramaStage: React.FC<{ setId: string; grade: GradePreset }> = ({ setId, grade }) => {
  const isNight = setId.includes("night");
  const floorColor = isNight ? "#9C7B5B" : "#DFC9A6";
  const wallColor = isNight ? "#B88C64" : "#F3E6CE";
  const pillarColor = isNight ? "#C8B39A" : "#FAF5EB";

  return (
    <group>
      <color attach="background" args={[grade.bgColor]} />
      <SceneLights setId={setId} grade={grade} castShadows />

      {/* Ground / Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color={floorColor} roughness={0.82} />
      </mesh>

      {/* Back Architectural Wall */}
      <mesh position={[0, 3.6, -4.4]} receiveShadow>
        <boxGeometry args={[22, 7.5, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.78} />
        <Edges threshold={18} color="#161618" />
      </mesh>

      {/* Ink-Outlined Columns */}
      {[-5.2, -2.2, 2.2, 5.2].map((x, idx) => (
        <mesh key={idx} position={[x, 2.4, -3.5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.3, 4.8, 16]} />
          <meshStandardMaterial color={pillarColor} roughness={0.65} />
          <Edges threshold={18} color="#161618" />
        </mesh>
      ))}

      {/* Rich World Props so sets feel alive & layered */}
      <TableAndProps3D woodColor="#9C5A2B" />
      <group position={[-3.4, 0, -2.2]} scale={[0.75, 0.75, 0.75]}>
        <House3D wallColor="#F2CC8F" roofColor="#E07A5F" />
      </group>
      <group position={[3.6, 0, -2.6]} scale={[0.65, 0.65, 0.65]}>
        <Castle3D stoneColor="#CBD5E1" accentColor="#D97706" />
      </group>
      <group position={[0, 0, 2.5]} scale={[0.68, 0.68, 0.68]}>
        <RiverAndBridge3D waterColor="#2B8CBE" />
      </group>
      {[-2.4, 2.4].map((fx, i) => (
        <group key={i} position={[fx, 0, -1.6]} scale={[0.85, 0.85, 0.85]}>
          <FlowersAndTrees3D petalColor={i === 0 ? "#F43F5E" : "#FBBF24"} />
        </group>
      ))}
      <group position={[-4.5, 0, 0.8]} rotation={[0, 0.35, 0]} scale={[0.62, 0.62, 0.62]}>
        <DadCar3D color="#D93829" />
      </group>
      <group position={[4.5, 0, 1.0]} rotation={[0, -0.35, 0]} scale={[0.52, 0.52, 0.52]}>
        <BusWithInterior3D color="#EAB308" />
      </group>
      <group position={[2.0, 0, 1.3]} rotation={[0, -0.4, 0]} scale={[0.65, 0.65, 0.65]}>
        <HorseWithRider3D horseColor="#7C4A27" riderColor="#7C3AED" hasRider />
      </group>
    </group>
  );
};
