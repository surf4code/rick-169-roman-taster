import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { GradePreset } from "../utils/colorGrade";
import { buildSet } from "./sets/dressing";
import { floorTexture, wallTexture } from "./sets/textures";
import * as P from "./props/RomanProps";
import { SetDressing } from "./sets/extras";

const MAP: Record<string, React.FC<any>> = {
  Amphora: P.Amphora, Jug: P.Jug, Goblet: P.Goblet, Bowl: P.Bowl, Platter: P.Platter, Table: P.Table, Couch: P.Couch, Stool: P.Stool,
  Crate: P.Crate, Barrel: P.Barrel, Sack: P.Sack, Basket: P.Basket, Rug: P.Rug, Column: P.Column, Arch: P.Arch, Door: P.Door,
  Window: P.Window, Banner: P.Banner, Bust: P.Bust, Torch: P.Torch, Brazier: P.Brazier, OilLamp: P.OilLamp, HangingLamp: P.HangingLamp,
  Plant: P.Plant, Shelf: P.Shelf, Cauldron: P.Cauldron, Oven: P.Oven, Hanging: P.Hanging, Bed: P.Bed, Laundry: P.Laundry,
  Scroll: P.Scroll, Loaf: P.Loaf, Chandelier: P.Chandelier, Cushion: P.Cushion,
};

/** Number of dressed props in a set (used by the density QA gate). */
export const setObjectCount = (setId: string) => buildSet(setId).items.length;

export const RomanDioramaStage: React.FC<{ setId: string; grade: GradePreset; cine?: boolean }> = ({ setId, grade, cine = false }) => {
  const frame = useCurrentFrame();
  const spec = useMemo(() => buildSet(setId), [setId]);
  const wallTex = useMemo(() => wallTexture(spec.wall, Math.max(2, Math.round((spec.halfW * 2) / 3)), spec.night), [spec]);
  const floorTex = useMemo(() => floorTexture(spec.floor, [Math.round(spec.halfW * 2 / 3), Math.round(spec.floorD / 3)]), [spec]);
  const sideTex = useMemo(() => wallTexture(spec.wall, Math.max(2, Math.round(spec.floorD / 3)), spec.night), [spec]);
  const isCorridor = setId.includes("corridor");
  const wallMat = <meshStandardMaterial map={wallTex} roughness={0.85} />;

  return (
    <group>
      <color attach="background" args={[spec.night ? "#6C86C9" : spec.sky]} />
      <ambientLight intensity={grade.ambientIntensity} />
      <hemisphereLight args={[grade.hemiSkyColor, grade.hemiGroundColor, grade.hemiIntensity]} />
      <directionalLight position={cine ? [-6.5, 3.4, 4.2] : [4.5, 8.0, 5.2]} intensity={grade.keyLightIntensity * (cine ? 1.18 : 1)} color={cine ? "#FFC98A" : grade.keyLightColor} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={0.5} shadow-camera-far={30} shadow-bias={-0.0004} />
      <directionalLight position={[-5, 3.8, -2.5]} intensity={grade.rimLightIntensity} color={"#9FB0F0"} />
      {cine && <directionalLight position={[5, 2.6, -4]} intensity={1.1} color="#FFD3A0" />}
      {spec.torchLights.map((p, i) => <pointLight key={i} position={p} intensity={spec.night ? 5 : 3} distance={9} decay={1.6} color="#FFB45E" />)}

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, spec.floorZ]} receiveShadow>
        <planeGeometry args={[spec.halfW * 2 + 6, spec.floorD]} />
        <meshStandardMaterial map={floorTex} roughness={0.8} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, spec.wallH / 2, spec.backZ - 0.15]} receiveShadow>
        <boxGeometry args={[spec.halfW * 2 + 6, spec.wallH, 0.3]} />
        {wallMat}
      </mesh>
      {/* side walls */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (spec.halfW + 0.15), spec.wallH / 2, spec.floorZ]} receiveShadow>
          <boxGeometry args={[0.3, spec.wallH, spec.floorD]} />
          <meshStandardMaterial map={sideTex} roughness={0.85} />
        </mesh>
      ))}
      {/* ceiling beams for interiors so low-angle shots do not open onto void */}
      {(isCorridor || spec.wall === "plaster" || spec.wall === "brick" || spec.wall === "stone") && (
        <mesh position={[0, spec.wallH, spec.floorZ]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[spec.halfW * 2 + 6, spec.floorD]} />
          <meshStandardMaterial color={isCorridor ? "#8A4630" : "#7A4A2E"} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
      {!isCorridor && Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, spec.wallH - 0.35, spec.backZ + 1.1 + i * 2.4]} castShadow>
          <boxGeometry args={[spec.halfW * 2, 0.3, 0.35]} />
          <meshStandardMaterial color="#6E3F22" roughness={0.8} />
        </mesh>
      ))}

      <SetDressing spec={spec} setId={setId} night={spec.night} frame={frame} />

      {spec.items.map((it, i) => {
        const C = MAP[it.t];
        if (!C) return null;
        return <C key={i} position={it.p} rotation={it.r} scale={it.s} color={it.c} frame={frame} night={spec.night} {...(it.o || {})} />;
      })}
    </group>
  );
};
