import React, { useEffect, useMemo } from "react";
import * as THREE from "three";

export const HR = 56; // head sphere radius (units)
type V2 = [number, number];
type V3 = [number, number, number];

/** face-plane (x right, y up, relative to head centre) -> point on the head sphere surface (+lift outwards) */
export const onSphere = (x: number, y: number, lift = 0): V3 => {
  const z = Math.sqrt(Math.max(HR * HR - x * x - y * y, 4));
  const l = Math.hypot(x, y, z), k = (l + lift) / l;
  return [x * k, y * k, z * k];
};
const UP = new THREE.Vector3(0, 0, 1);
export const faceQuat = (p: V3) => new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(...p).normalize());

/** a round-capped tube that follows the sphere surface through 2-D face points (brows, mouth lines) */
export const SurfaceStroke: React.FC<{ pts: V2[]; radius: number; lift?: number; mat: THREE.Material }> = ({ pts, radius, lift = 0.4, mat }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(...onSphere(x, y, lift + radius * 0.35))));
    return new THREE.TubeGeometry(curve, 20, radius, 10, false);
  }, [pts.map((p) => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("|"), radius, lift]);
  useEffect(() => () => geo.dispose(), [geo]);
  const a = onSphere(pts[0][0], pts[0][1], lift + radius * 0.35), b = onSphere(pts[pts.length - 1][0], pts[pts.length - 1][1], lift + radius * 0.35);
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <mesh position={a} scale={radius}><sphereGeometry args={[1, 12, 10]} /><primitive object={mat} attach="material" /></mesh>
      <mesh position={b} scale={radius}><sphereGeometry args={[1, 12, 10]} /><primitive object={mat} attach="material" /></mesh>
    </group>
  );
};
