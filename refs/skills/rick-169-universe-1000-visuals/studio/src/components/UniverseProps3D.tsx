import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, Edges } from "@react-three/drei";

export interface CatalogItemSpec {
  id: string;
  name: string;
  category: string;
  kind: string;
  builder: string;
  primaryColor: string;
  scale?: number;
  hasInkOutline?: boolean;
}

const InkEdges: React.FC<{ enabled?: boolean; threshold?: number }> = ({
  enabled = true,
  threshold = 18,
}) =>
  enabled ? <Edges scale={1.002} threshold={threshold} color="#161618" /> : null;

/** 1. Dad Car: classic family sedan / wagon with cabin, wheels, headlights, roof rack */
export const DadCar3D: React.FC<{ color?: string; ink?: boolean }> = ({
  color = "#D93829",
  ink = true,
}) => (
  <group>
    {/* Ground shadow disc */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[2.8, 1.5]} />
      <meshBasicMaterial color="#2B1F48" transparent opacity={0.32} depthWrite={false} />
    </mesh>
    {/* Lower chassis */}
    <RoundedBox args={[2.4, 0.44, 1.16]} position={[0, 0.44, 0]} radius={0.08} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.42} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Upper greenhouse cabin */}
    <RoundedBox args={[1.35, 0.42, 1.02]} position={[-0.08, 0.84, 0]} radius={0.09} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.42} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Tinted windows */}
    <RoundedBox args={[1.22, 0.28, 1.04]} position={[-0.08, 0.84, 0]} radius={0.05}>
      <meshStandardMaterial color="#BAE6FD" roughness={0.18} metalness={0.1} />
    </RoundedBox>
    {/* Dad's roof luggage box */}
    <RoundedBox args={[0.78, 0.18, 0.66]} position={[-0.12, 1.13, 0]} radius={0.04} castShadow>
      <meshStandardMaterial color="#C68642" roughness={0.7} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* 4 Wheels + hubcaps */}
    {[
      [-0.72, 0.28, 0.60],
      [0.72, 0.28, 0.60],
      [-0.72, 0.28, -0.60],
      [0.72, 0.28, -0.60],
    ].map(([wx, wy, wz], i) => (
      <group key={i} position={[wx, wy, wz]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.16, 20]} />
          <meshStandardMaterial color="#22242A" roughness={0.85} />
          <InkEdges enabled={ink} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, wz > 0 ? 0.085 : -0.085]}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 16]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.4} roughness={0.25} />
        </mesh>
      </group>
    ))}
    {/* Headlights */}
    {[0.38, -0.38].map((hz, i) => (
      <mesh key={i} position={[1.22, 0.48, hz]}>
        <boxGeometry args={[0.04, 0.14, 0.22]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FACC15" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
    ))}
  </group>
);

/** 2. Bus + Detailed Bus Interior (seats, grab poles, straps, aisle, windows) */
export const BusWithInterior3D: React.FC<{ color?: string; ink?: boolean }> = ({
  color = "#EAB308",
  ink = true,
}) => (
  <group>
    {/* Outer bus shell (open front/side cutaway friendly) */}
    <RoundedBox args={[4.4, 1.55, 1.85]} position={[0, 1.15, 0]} radius={0.12} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.45} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Interior floor & side aisle */}
    <mesh position={[0, 0.42, 0]} receiveShadow>
      <boxGeometry args={[4.1, 0.08, 1.65]} />
      <meshStandardMaterial color="#64748B" roughness={0.8} />
      <InkEdges enabled={ink} />
    </mesh>
    {/* Passenger seat rows along left & right */}
    {[-1.4, -0.45, 0.5, 1.45].map((sx, idx) => (
      <React.Fragment key={idx}>
        <group position={[sx, 0.68, 0.52]}>
          <RoundedBox args={[0.52, 0.14, 0.52]} radius={0.04} castShadow>
            <meshStandardMaterial color="#2563EB" roughness={0.65} />
            <InkEdges enabled={ink} />
          </RoundedBox>
          <RoundedBox args={[0.14, 0.52, 0.52]} position={[-0.2, 0.26, 0]} radius={0.04} castShadow>
            <meshStandardMaterial color="#1D4ED8" roughness={0.65} />
            <InkEdges enabled={ink} />
          </RoundedBox>
        </group>
        <group position={[sx, 0.68, -0.52]}>
          <RoundedBox args={[0.52, 0.14, 0.52]} radius={0.04} castShadow>
            <meshStandardMaterial color="#2563EB" roughness={0.65} />
            <InkEdges enabled={ink} />
          </RoundedBox>
          <RoundedBox args={[0.14, 0.52, 0.52]} position={[-0.2, 0.26, 0]} radius={0.04} castShadow>
            <meshStandardMaterial color="#1D4ED8" roughness={0.65} />
            <InkEdges enabled={ink} />
          </RoundedBox>
        </group>
      </React.Fragment>
    ))}
    {/* Overhead grab rail + hanging hand straps */}
    <mesh position={[0, 1.72, 0.25]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.025, 3.8, 12]} />
      <meshStandardMaterial color="#E2E8F0" metalness={0.5} roughness={0.3} />
    </mesh>
    {[-1.1, 0, 1.1].map((hx, i) => (
      <group key={i} position={[hx, 1.52, 0.25]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <torusGeometry args={[0.055, 0.014, 8, 16]} />
          <meshStandardMaterial color="#F97316" />
        </mesh>
      </group>
    ))}
    {/* Wheels */}
    {[-1.35, 1.35].map((wx, i) =>
      [-0.86, 0.86].map((wz, j) => (
        <mesh key={`${i}-${j}`} position={[wx, 0.34, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.18, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
          <InkEdges enabled={ink} />
        </mesh>
      ))
    )}
  </group>
);

/** 3. Horse + Person Sitting on Horse */
export const HorseWithRider3D: React.FC<{
  horseColor?: string;
  riderColor?: string;
  hasRider?: boolean;
  ink?: boolean;
}> = ({ horseColor = "#7C4A27", riderColor = "#2563EB", hasRider = true, ink = true }) => (
  <group>
    {/* Horse barrel body */}
    <RoundedBox args={[1.35, 0.56, 0.52]} position={[0, 0.92, 0]} radius={0.22} castShadow receiveShadow>
      <meshStandardMaterial color={horseColor} roughness={0.72} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Neck & head */}
    <group position={[0.68, 1.25, 0]} rotation={[0, 0, -0.55]}>
      <RoundedBox args={[0.34, 0.68, 0.34]} radius={0.14} castShadow>
        <meshStandardMaterial color={horseColor} roughness={0.72} />
        <InkEdges enabled={ink} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.26, 0.28]} position={[0.24, 0.28, 0]} radius={0.11} castShadow>
        <meshStandardMaterial color={horseColor} roughness={0.72} />
        <InkEdges enabled={ink} />
      </RoundedBox>
      {/* Ears */}
      {[-0.08, 0.08].map((ez, i) => (
        <mesh key={i} position={[0.14, 0.44, ez]}>
          <coneGeometry args={[0.05, 0.16, 8]} />
          <meshStandardMaterial color={horseColor} />
          <InkEdges enabled={ink} />
        </mesh>
      ))}
    </group>
    {/* Mane & tail */}
    <RoundedBox args={[0.14, 0.52, 0.12]} position={[0.56, 1.32, 0]} rotation={[0, 0, -0.45]} radius={0.05}>
      <meshStandardMaterial color="#271A12" roughness={0.85} />
    </RoundedBox>
    <RoundedBox args={[0.14, 0.56, 0.14]} position={[-0.76, 0.82, 0]} rotation={[0, 0, 0.35]} radius={0.06}>
      <meshStandardMaterial color="#271A12" roughness={0.85} />
    </RoundedBox>
    {/* 4 Legs */}
    {[
      [-0.48, 0.36, 0.18],
      [-0.48, 0.36, -0.18],
      [0.48, 0.36, 0.18],
      [0.48, 0.36, -0.18],
    ].map(([lx, ly, lz], i) => (
      <mesh key={i} position={[lx, ly, lz]} castShadow>
        <cylinderGeometry args={[0.075, 0.06, 0.72, 12]} />
        <meshStandardMaterial color={horseColor} roughness={0.75} />
        <InkEdges enabled={ink} />
      </mesh>
    ))}
    {/* Saddle */}
    <RoundedBox args={[0.48, 0.14, 0.56]} position={[-0.04, 1.22, 0]} radius={0.05} castShadow>
      <meshStandardMaterial color="#9A3412" roughness={0.65} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Person sitting on horse */}
    {hasRider && (
      <group position={[-0.04, 1.28, 0]}>
        {/* Torso */}
        <RoundedBox args={[0.32, 0.52, 0.28]} position={[0, 0.28, 0]} radius={0.12} castShadow>
          <meshStandardMaterial color={riderColor} roughness={0.6} />
          <InkEdges enabled={ink} />
        </RoundedBox>
        {/* Head */}
        <mesh position={[0.02, 0.72, 0]} castShadow>
          <sphereGeometry args={[0.21, 20, 20]} />
          <meshStandardMaterial color="#F6EFE4" roughness={0.55} />
          <InkEdges enabled={ink} />
        </mesh>
        {/* Riding leg down horse flank */}
        <mesh position={[0.04, -0.06, 0.28]} rotation={[0.25, 0, -0.15]}>
          <cylinderGeometry args={[0.065, 0.055, 0.44, 10]} />
          <meshStandardMaterial color="#1E293B" />
          <InkEdges enabled={ink} />
        </mesh>
      </group>
    )}
  </group>
);

/** 4. River + Stone Bridge + Riverbank Stones & Reeds */
export const RiverAndBridge3D: React.FC<{ waterColor?: string; ink?: boolean }> = ({
  waterColor = "#2B8CBE",
  ink = true,
}) => (
  <group>
    {/* River water strip */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
      <planeGeometry args={[18, 3.8]} />
      <meshStandardMaterial color={waterColor} roughness={0.22} metalness={0.15} />
    </mesh>
    {/* Stone arch bridge deck & parapets */}
    <RoundedBox args={[1.9, 0.24, 4.4]} position={[0, 0.58, 0]} radius={0.05} castShadow receiveShadow>
      <meshStandardMaterial color="#94A3B8" roughness={0.78} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {[-0.86, 0.86].map((px, i) => (
      <RoundedBox key={i} args={[0.16, 0.28, 4.3]} position={[px, 0.82, 0]} radius={0.03} castShadow>
        <meshStandardMaterial color="#CBD5E1" roughness={0.75} />
        <InkEdges enabled={ink} />
      </RoundedBox>
    ))}
    {/* Riverbank pebbles & reeds */}
    {[-3.2, -1.8, 1.7, 3.4].map((rx, i) => (
      <mesh key={i} position={[rx, 0.1, 2.15]} scale={[1.4, 0.65, 1.0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#78716C" roughness={0.85} />
        <InkEdges enabled={ink} />
      </mesh>
    ))}
  </group>
);

/** 5. House: cozy 2.5D house with pitched roof, door, windows, porch */
export const House3D: React.FC<{ wallColor?: string; roofColor?: string; ink?: boolean }> = ({
  wallColor = "#F2CC8F",
  roofColor = "#E07A5F",
  ink = true,
}) => (
  <group>
    <RoundedBox args={[2.4, 1.75, 2.0]} position={[0, 0.88, 0]} radius={0.06} castShadow receiveShadow>
      <meshStandardMaterial color={wallColor} roughness={0.75} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Pitched roof */}
    <mesh position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[2.1, 1.05, 4]} />
      <meshStandardMaterial color={roofColor} roughness={0.7} />
      <InkEdges enabled={ink} />
    </mesh>
    {/* Door */}
    <mesh position={[0, 0.55, 1.02]}>
      <boxGeometry args={[0.52, 1.08, 0.08]} />
      <meshStandardMaterial color="#7C4A27" roughness={0.75} />
      <InkEdges enabled={ink} />
    </mesh>
    {/* Two windows */}
    {[-0.72, 0.72].map((wx, i) => (
      <mesh key={i} position={[wx, 1.05, 1.02]}>
        <boxGeometry args={[0.42, 0.42, 0.06]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.35} />
        <InkEdges enabled={ink} />
      </mesh>
    ))}
  </group>
);

/** 6. Castle: fortress keep, corner towers, battlements, gate arch */
export const Castle3D: React.FC<{ stoneColor?: string; accentColor?: string; ink?: boolean }> = ({
  stoneColor = "#CBD5E1",
  accentColor = "#D97706",
  ink = true,
}) => (
  <group>
    {/* Central keep */}
    <RoundedBox args={[2.8, 2.6, 2.2]} position={[0, 1.3, 0]} radius={0.06} castShadow receiveShadow>
      <meshStandardMaterial color={stoneColor} roughness={0.78} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {/* Flanking towers + conical roofs */}
    {[-1.55, 1.55].map((tx, i) => (
      <group key={i} position={[tx, 0, 0.4]}>
        <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.52, 0.56, 3.3, 18]} />
          <meshStandardMaterial color={stoneColor} roughness={0.78} />
          <InkEdges enabled={ink} />
        </mesh>
        <mesh position={[0, 3.7, 0]} castShadow>
          <coneGeometry args={[0.66, 0.9, 18]} />
          <meshStandardMaterial color={accentColor} roughness={0.65} />
          <InkEdges enabled={ink} />
        </mesh>
      </group>
    ))}
    {/* Gate arch */}
    <mesh position={[0, 0.65, 1.12]}>
      <boxGeometry args={[0.76, 1.3, 0.1]} />
      <meshStandardMaterial color="#451A03" roughness={0.85} />
      <InkEdges enabled={ink} />
    </mesh>
  </group>
);

/** 7. Table + Feast / Scroll Props */
export const TableAndProps3D: React.FC<{ woodColor?: string; ink?: boolean }> = ({
  woodColor = "#9C5A2B",
  ink = true,
}) => (
  <group>
    <RoundedBox args={[2.2, 0.14, 1.15]} position={[0, 0.78, 0]} radius={0.04} castShadow receiveShadow>
      <meshStandardMaterial color={woodColor} roughness={0.65} />
      <InkEdges enabled={ink} />
    </RoundedBox>
    {[
      [-0.95, 0.39, 0.45],
      [0.95, 0.39, 0.45],
      [-0.95, 0.39, -0.45],
      [0.95, 0.39, -0.45],
    ].map(([lx, ly, lz], i) => (
      <mesh key={i} position={[lx, ly, lz]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.78, 12]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
        <InkEdges enabled={ink} />
      </mesh>
    ))}
    {/* Golden goblet & platter on table */}
    <mesh position={[-0.35, 1.0, 0.05]} castShadow>
      <cylinderGeometry args={[0.13, 0.07, 0.3, 16]} />
      <meshStandardMaterial color="#EAB308" metalness={0.5} roughness={0.28} />
      <InkEdges enabled={ink} />
    </mesh>
    <mesh position={[0.35, 0.89, -0.05]} castShadow>
      <cylinderGeometry args={[0.32, 0.26, 0.08, 20]} />
      <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.35} />
      <InkEdges enabled={ink} />
    </mesh>
  </group>
);

/** 8. Flowers + Lush Trees / Bushes so environments never look bare */
export const FlowersAndTrees3D: React.FC<{ petalColor?: string; ink?: boolean }> = ({
  petalColor = "#F43F5E",
  ink = true,
}) => {
  const petals = useMemo(
    () => [
      [0.14, 0, 0],
      [-0.14, 0, 0],
      [0, 0, 0.14],
      [0, 0, -0.14],
    ],
    []
  );
  return (
    <group>
      {/* Flower blossom */}
      <group position={[0, 0.36, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.36, 8]} />
          <meshStandardMaterial color="#22C55E" roughness={0.75} />
        </mesh>
        {petals.map(([px, py, pz], i) => (
          <mesh key={i} position={[px, py, pz]} castShadow>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color={petalColor} roughness={0.55} />
            <InkEdges enabled={ink} />
          </mesh>
        ))}
        <mesh castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#FACC15" roughness={0.5} />
        </mesh>
      </group>
      {/* Companion stylized tree */}
      <group position={[0.85, 0, -0.35]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.14, 0.9, 12]} />
          <meshStandardMaterial color="#7C4A27" roughness={0.8} />
          <InkEdges enabled={ink} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <icosahedronGeometry args={[0.58, 1]} />
          <meshStandardMaterial color="#22C55E" roughness={0.72} />
          <InkEdges enabled={ink} />
        </mesh>
      </group>
    </group>
  );
};

export const CatalogProp3D: React.FC<{ item: CatalogItemSpec }> = ({ item }) => {
  const ink = item.hasInkOutline ?? true;
  const sc = item.scale ?? 1;
  return (
    <group scale={[sc, sc, sc]}>
      {item.builder === "car" && <DadCar3D color={item.primaryColor} ink={ink} />}
      {item.builder === "bus" && <BusWithInterior3D color={item.primaryColor} ink={ink} />}
      {item.builder === "horse" && (
        <HorseWithRider3D
          horseColor={item.primaryColor}
          hasRider={item.name.includes("Person_Sitting_On_Horse")}
          ink={ink}
        />
      )}
      {item.builder === "river" && <RiverAndBridge3D waterColor={item.primaryColor} ink={ink} />}
      {item.builder === "house" && <House3D wallColor={item.primaryColor} ink={ink} />}
      {item.builder === "castle" && <Castle3D stoneColor={item.primaryColor} ink={ink} />}
      {item.builder === "table" && <TableAndProps3D woodColor={item.primaryColor} ink={ink} />}
      {item.builder === "flower" && <FlowersAndTrees3D petalColor={item.primaryColor} ink={ink} />}
    </group>
  );
};
