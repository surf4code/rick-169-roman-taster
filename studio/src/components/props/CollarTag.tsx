import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

let TAG_TEX: THREE.CanvasTexture | null = null;
function tagTexture(text: string) {
  if (TAG_TEX) return TAG_TEX;
  const c = document.createElement("canvas"); c.width = 1024; c.height = 640;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 1024, 640);
  gr.addColorStop(0, "#E2A957"); gr.addColorStop(0.5, "#C98A3C"); gr.addColorStop(1, "#9A6226");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 640);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(60,30,5,${Math.random() * 0.1})`; g.fillRect(Math.random() * 1024, Math.random() * 640, 3, 3); }
  g.strokeStyle = "#5C3612"; g.lineWidth = 14; g.strokeRect(34, 34, 956, 572);
  g.strokeStyle = "rgba(255,230,170,0.6)"; g.lineWidth = 5; g.strokeRect(52, 52, 920, 536);
  g.fillStyle = "#4A2A0E"; g.textAlign = "center"; g.font = "900 104px 'Arial Black', Arial, sans-serif";
  const words = text.split(" ");
  const lines = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  lines.forEach((l, i) => { g.fillStyle = "rgba(255,225,160,0.55)"; g.fillText(l, 514, 270 + i * 150 + 4); g.fillStyle = "#4A2A0E"; g.fillText(l, 512, 270 + i * 150); });
  TAG_TEX = new THREE.CanvasTexture(c); TAG_TEX.colorSpace = THREE.SRGBColorSpace; TAG_TEX.anisotropy = 8;
  return TAG_TEX;
}

/** Bronze slave collar tag on a leather cord. Slow sway so the macro insert is never static. */
export const CollarTag: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; text?: string }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, text = "PROPERTY OF THE EMPEROR" }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.07) * 0.09, turn = Math.sin(frame * 0.045) * 0.22 - 0.15;
  const INK = "#231A29";
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[0, turn, sway]}>
        <mesh position={[0, 0.0, -0.012]}><boxGeometry args={[0.56, 0.36, 0.03]} /><meshStandardMaterial color={INK} /></mesh>
        <mesh><boxGeometry args={[0.52, 0.32, 0.03]} /><meshStandardMaterial map={tagTexture(text)} roughness={0.3} metalness={0.35} /></mesh>
        <mesh position={[0, 0.2, 0]}><torusGeometry args={[0.055, 0.017, 10, 24]} /><meshStandardMaterial color="#C98A3C" roughness={0.3} metalness={0.5} /></mesh>
        <mesh position={[0, 0.2, 0]} scale={[1.12, 1.12, 0.8]}><torusGeometry args={[0.055, 0.02, 10, 24]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.012, 0.012, 0.65, 8]} /><meshStandardMaterial color="#5B3A1E" roughness={0.9} /></mesh>
      </group>
    </group>
  );
};
