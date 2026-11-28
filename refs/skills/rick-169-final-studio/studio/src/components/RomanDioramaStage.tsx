import React from "react";
import { RoundedBox } from "@react-three/drei";
import { GradePreset } from "../utils/colorGrade";

export const RomanDioramaStage: React.FC<{ setId: string; grade: GradePreset }> = ({ setId, grade }) => {
  const isNight = setId.includes("night");
  const floorColor = isNight ? "#9C7B5B" : "#DFC9A6";
  const wallColor = isNight ? "#B88C64" : "#F3E6CE";
  const pillarColor = isNight ? "#C8B39A" : "#FAF5EB";

  return (
    <group>
      <color attach="background" args={[grade.bgColor]} />
      <ambientLight intensity={grade.ambientIntensity} />
      <hemisphereLight args={[grade.hemiSkyColor, grade.hemiGroundColor, grade.hemiIntensity]} />
      <directionalLight position={[4.5, 7.0, 4.2]} intensity={grade.keyLightIntensity} color={grade.keyLightColor} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4.5, 3.8, -2.5]} intensity={grade.rimLightIntensity} color={grade.rimLightColor} />
      {isNight && <pointLight position={[0, 2.8, 0.5]} intensity={3.2} distance={10} color="#FFAE52" />}

      {/* Warm Stone / Marble Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color={floorColor} roughness={0.82} />
      </mesh>
      {/* Back Colonnade Wall */}
      <mesh position={[0, 3.6, -3.8]} receiveShadow>
        <boxGeometry args={[18, 7.5, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.78} />
      </mesh>
      {/* Roman Pillars */}
      {[-4.2, -1.6, 1.6, 4.2].map((x, idx) => (
        <mesh key={idx} position={[x, 2.4, -3.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.30, 4.8, 16]} />
          <meshStandardMaterial color={pillarColor} roughness={0.65} />
        </mesh>
      ))}
      {/* Banquet Table / Kitchen Counter */}
      <RoundedBox args={[3.2, 0.85, 1.1]} position={[0, 0.43, -1.35]} radius={0.08} castShadow receiveShadow>
        <meshStandardMaterial color="#B56E3B" roughness={0.62} />
      </RoundedBox>
      {/* Golden Goblet Prop */}
      <mesh position={[0, 1.05, -1.2]} castShadow>
        <cylinderGeometry args={[0.14, 0.08, 0.34, 16]} />
        <meshStandardMaterial color="#EAB308" metalness={0.55} roughness={0.28} />
      </mesh>
    </group>
  );
};
