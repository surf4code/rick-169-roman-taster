import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import charactersData from "../data/characters.json";
import { EmotionName } from "../utils/emotions";
import { mulberry32 } from "../utils/anim";
import { CharacterId, CharacterSvg } from "./CharacterSvg";

export type { CharacterId };

export interface CutoutCharacterProps {
  characterId: CharacterId;
  position: [number, number, number];
  scale?: number;
  emotion: EmotionName;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  stepOnTwos?: boolean;
  flipX?: boolean;
}

export const CutoutCharacter: React.FC<CutoutCharacterProps> = ({
  characterId,
  position,
  scale = 1,
  emotion,
  rmsAmplitude = 0,
  spectralCentroid = 0.5,
  stepOnTwos = true,
  flipX = false,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spec =
    (charactersData.cast as Record<string, any>)[characterId] ||
    charactersData.cast.taster_protagonist;
  const charFrame = stepOnTwos ? Math.floor(rawFrame / 2) * 2 : rawFrame;

  const seed = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < characterId.length; i++) h = Math.imul(h ^ characterId.charCodeAt(i), 16777619);
    return h >>> 0;
  }, [characterId]);

  const isBlinking = useMemo(() => {
    const cycle = Math.floor(charFrame / (fps * 3.1));
    const rng = mulberry32(seed + cycle);
    const blinkStart = Math.floor(rng() * (fps * 2.4));
    const localF = charFrame % Math.floor(fps * 3.1);
    return localF >= blinkStart && localF <= blinkStart + 3;
  }, [charFrame, fps, seed]);

  const breathY = Math.sin(charFrame * 0.12 + (seed % 7)) * 2.5;
  const talkNod = rmsAmplitude > 0.18 ? Math.sin(charFrame * 0.65) * 3.2 * rmsAmplitude : 0;
  const finalScale = scale * (spec.heightScale ?? 1.0);

  return (
    <group position={position} scale={[finalScale * (flipX ? -1 : 1), finalScale, finalScale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.56, 28]} />
        <meshBasicMaterial color="#1A203A" transparent opacity={0.32} />
      </mesh>
      <Html transform distanceFactor={4.1} position={[0, 1.18, 0]} style={{ pointerEvents: "none", userSelect: "none" }}>
        <CharacterSvg
          characterId={characterId}
          emotion={emotion}
          rmsAmplitude={rmsAmplitude}
          spectralCentroid={spectralCentroid}
          isBlinking={isBlinking}
          breathY={breathY}
          talkNod={talkNod}
          uid={`${characterId}-3d`}
        />
      </Html>
    </group>
  );
};
