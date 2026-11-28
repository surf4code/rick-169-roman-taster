import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { GradePreset } from "../utils/colorGrade";
import { buildSet } from "./sets/dressing";
import { floorTexture, wallTexture, mikoWallTexture, mikoFloorTexture, mikoPalette } from "./sets/textures";
import * as P from "./props/RomanProps";
import { SetDressing } from "./sets/extras";
import { mulberry32 } from "../utils/anim";

/** Miko-style "painted" surfaces: blur the procedural texture (tiled 3x3 first so the repeat has no seams). */
const soften = (t: THREE.CanvasTexture, px: number): THREE.CanvasTexture => {
  const src = t.image as HTMLCanvasElement;
  const w = src.width, h = src.height;
  const big = document.createElement("canvas"); big.width = w * 3; big.height = h * 3;
  const bc = big.getContext("2d")!;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bc.drawImage(src, i * w, j * h);
  const out = document.createElement("canvas"); out.width = w; out.height = h;
  const oc = out.getContext("2d")!;
  oc.filter = `blur(${px}px) saturate(1.08) brightness(1.05)`;
  oc.drawImage(big, -w, -h);
  t.image = out; t.needsUpdate = true;
  return t;
};

let orbTex: THREE.CanvasTexture | null = null;
const getOrbTex = () => {
  if (orbTex) return orbTex;
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,0.75)"); g.addColorStop(0.8, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  orbTex = new THREE.CanvasTexture(cv);
  return orbTex;
};
const ORB_COLS = ["#FFC46B", "#FFE2A6", "#FFAF6A", "#FFD58A"];
/** Warm glowing orbs hung behind/around the action; depth-of-field turns them into Miko-style bokeh lights. */
const BokehOrbs: React.FC<{ spec: ReturnType<typeof buildSet>; frame: number }> = ({ spec, frame }) => {
  const orbs = useMemo(() => {
    const r = mulberry32(4242);
    const list: { p: [number, number, number]; s: number; c: string; ph: number; o: number }[] = [];
    spec.torchLights.forEach((p) => list.push({ p: [p[0], p[1], p[2] + 0.2], s: 0.8, c: "#FFC46B", ph: r() * 6, o: 0.5 }));
    for (let i = 0; i < 0; i++) list.push({ p: [(r() - 0.5) * spec.halfW * 1.7, 1.2 + r() * 2.6, spec.backZ + 0.5 + r() * 1.4], s: 0.22 + r() * 0.34, c: ORB_COLS[i % 4], ph: r() * 6, o: 0.55 + r() * 0.3 });
    for (let i = 0; i < 0; i++) list.push({ p: [(r() - 0.5) * 7, 0.6 + r() * 2.4, 2.6 + r() * 1.2], s: 0.16 + r() * 0.2, c: ORB_COLS[(i + 1) % 4], ph: r() * 6, o: 0.4 });
    return list;
  }, [spec]);
  const tex = getOrbTex();
  return (
    <group>
      {orbs.map((o, i) => (
        <sprite key={i} position={o.p} scale={[o.s, o.s, o.s]}>
          <spriteMaterial map={tex} color={o.c} transparent opacity={o.o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
    </group>
  );
};

const MAP: Record<string, React.FC<any>> = {
  Amphora: P.Amphora, Jug: P.Jug, Goblet: P.Goblet, Bowl: P.Bowl, Platter: P.Platter, Table: P.Table, Couch: P.Couch, Stool: P.Stool,
  Crate: P.Crate, Barrel: P.Barrel, Sack: P.Sack, Basket: P.Basket, Rug: P.Rug, Column: P.Column, Arch: P.Arch, Door: P.Door,
  Window: P.Window, Banner: P.Banner, Bust: P.Bust, Torch: P.Torch, Brazier: P.Brazier, OilLamp: P.OilLamp, HangingLamp: P.HangingLamp,
  Plant: P.Plant, Shelf: P.Shelf, Cauldron: P.Cauldron, Oven: P.Oven, Hanging: P.Hanging, Bed: P.Bed, Laundry: P.Laundry,
  Scroll: P.Scroll, Loaf: P.Loaf, Chandelier: P.Chandelier, Cushion: P.Cushion,
};

/** Miko keeps few, readable props: drop clutter, cap repeats. */
const MIKO_DROP = new Set(["Plant", "Basket", "Sack", "Crate", "Hanging", "Laundry", "Shelf", "Banner", "Cushion", "Goblet", "Platter", "Scroll", "Bowl", "Loaf", "Chandelier", "Barrel", "Bust", "Jug", "Brazier", "Door", "Arch"]);
const MIKO_CAP: Record<string, number> = { Amphora: 3, Column: 2, Window: 2, Table: 1, Stool: 1, Torch: 2, OilLamp: 1, Couch: 2, Bed: 1, Arch: 1, Rug: 1, Cauldron: 1, Oven: 1 };
function mikoReduce(items: any[]) {
  const seen: Record<string, number> = {};
  return items.filter((it) => {
    if (MIKO_DROP.has(it.t)) return false;
    seen[it.t] = (seen[it.t] || 0) + 1;
    return seen[it.t] <= (MIKO_CAP[it.t] ?? 2);
  });
}

/** Ink outline for every solid prop: inverted hull pushed along the VIEW-space normal, so the width is constant whatever the mesh scale. */
const hullMat = (w: number) => {
  const m = new THREE.MeshBasicMaterial({ color: "#1D1524", side: THREE.BackSide, toneMapped: false });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `
      vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
      mvPosition.xyz += normalize( normalMatrix * normal ) * ${w.toFixed(4)};
      gl_Position = projectionMatrix * mvPosition;`);
  };
  m.customProgramCacheKey = () => "propink" + w;
  return m;
};
const OutlinedGroup: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const ref = React.useRef<THREE.Group>(null);
  React.useLayoutEffect(() => {
    const g = ref.current; if (!g || !enabled) return;
    const mat = hullMat(0.012), added: THREE.Mesh[] = [];
    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !m.userData.__hull) meshes.push(m); });
    meshes.forEach((m) => {
      const mm = m.material as THREE.Material;
      if (Array.isArray(mm) || (mm as any).transparent || (mm as any).isMeshBasicMaterial || (mm as any).side === THREE.DoubleSide) return;
      const h = new THREE.Mesh(m.geometry, mat); h.userData.__hull = true; h.castShadow = false; h.receiveShadow = false; h.renderOrder = -1;
      m.add(h); added.push(h);
    });
    return () => { added.forEach((h) => h.parent?.remove(h)); };
  }, [enabled, children]);
  return <group ref={ref}>{children}</group>;
};

/** Number of dressed props in a set (used by the density QA gate). */
export const setObjectCount = (setId: string) => buildSet(setId).items.length;

export const RomanDioramaStage: React.FC<{ setId: string; grade: GradePreset; cine?: boolean; miko?: boolean }> = ({ setId, grade, cine = false, miko = false }) => {
  const { fps } = useVideoConfig();
  const frame = (useCurrentFrame() * 30) / fps; // 30-fps-equivalent clock so flicker/sway speed is identical at 60 fps
  const spec = useMemo(() => buildSet(setId), [setId]);
  const pal = mikoPalette(setId);
  const wallTex = useMemo(() => { if (miko) return mikoWallTexture(pal, Math.max(2, Math.round((spec.halfW * 2) / 3))); const t = wallTexture(spec.wall, Math.max(2, Math.round((spec.halfW * 2) / 3)), spec.night); return miko ? soften(t, 0.9) : t; }, [spec, miko]);
  const floorTex = useMemo(() => { if (miko) return mikoFloorTexture(pal, [Math.round(spec.halfW * 2 / 3), Math.round(spec.floorD / 3)]); const t = floorTexture(spec.floor, [Math.round(spec.halfW * 2 / 3), Math.round(spec.floorD / 3)]); return miko ? soften(t, 0.7) : t; }, [spec, miko]);
  const sideTex = useMemo(() => { if (miko) return mikoWallTexture(pal, Math.max(2, Math.round(spec.floorD / 3))); const t = wallTexture(spec.wall, Math.max(2, Math.round(spec.floorD / 3)), spec.night); return miko ? soften(t, 0.9) : t; }, [spec, miko]);
  const isCorridor = setId.includes("corridor");
  const wallMat = <meshStandardMaterial map={wallTex} roughness={0.85} />;

  return (
    <group>
      <color attach="background" args={[miko ? pal.bg : spec.night ? "#6C86C9" : spec.sky]} />
      {miko && <fog attach="fog" args={[pal.fog, 3.2, 15]} />}
      <ambientLight intensity={grade.ambientIntensity} />
      <hemisphereLight args={[miko ? pal.hemiSky : grade.hemiSkyColor, grade.hemiGroundColor, grade.hemiIntensity]} />
      <directionalLight position={miko ? [-6.0, 4.6, 4.6] : cine ? [-6.5, 3.4, 4.2] : [4.5, 8.0, 5.2]} intensity={grade.keyLightIntensity * (cine && !miko ? 1.18 : 1)} color={cine ? "#FFC98A" : grade.keyLightColor} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-radius={miko ? 5 : 1} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={0.5} shadow-camera-far={30} shadow-bias={-0.0004} />
      <directionalLight position={miko ? [5.5, 3.2, -3] : [-5, 3.8, -2.5]} intensity={grade.rimLightIntensity} color={miko ? grade.rimLightColor : "#9FB0F0"} />
      {miko && <spotLight position={[-2.4, 4.4, 3.4]} angle={0.62} penumbra={1} intensity={85} distance={14} decay={2} color="#FFC48A" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />}
      {cine && !miko && <directionalLight position={[5, 2.6, -4]} intensity={1.1} color="#FFD3A0" />}
      {spec.torchLights.map((p, i) => <pointLight key={i} position={p} intensity={spec.night ? 5 : miko ? 4.2 : 3} distance={miko ? 7 : 9} decay={1.6} color="#FFB45E" />)}

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

      {!miko && <SetDressing spec={spec} setId={setId} night={spec.night} frame={frame} />}
      {miko && <BokehOrbs spec={spec} frame={frame} />}
      <OutlinedGroup enabled={miko} key={setId + (miko ? "m" : "")}>

      {(miko ? mikoReduce(spec.items) : spec.items).map((it, i) => {
        const C = MAP[it.t];
        if (!C) return null;
        return <C key={i} position={it.p} rotation={it.r} scale={it.s} color={it.c} frame={frame} night={spec.night} {...(it.o || {})} />;
      })}
      </OutlinedGroup>
    </group>
  );
};
