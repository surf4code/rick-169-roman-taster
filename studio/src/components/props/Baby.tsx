import React from "react";
import * as THREE from "three";
import { renderToStaticMarkup } from "react-dom/server";

const INK = "#231A29";
/** Baby in a swaddle, drawn in the same SVG region as the characters (x -40..320, y 60..380), Miko look. */
export function babyMarkup(blink: boolean, wrap = "#F3E3C6", band = "#C98A4E"): string {
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 60 360 320" width="1080" height="960">
      <g transform="translate(140 230) rotate(-14)">
        {/* swaddle bundle */}
        <path d="M -34 -6 Q -40 52 -4 70 Q 34 70 40 18 Q 42 -14 30 -24 Q 0 -34 -34 -6 Z" fill={wrap} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M -34 6 Q 0 26 40 8 M -30 30 Q 2 48 38 30" fill="none" stroke={band} strokeWidth="5" strokeLinecap="round" />
        <path d="M -34 6 Q 0 26 40 8 M -30 30 Q 2 48 38 30" fill="none" stroke={INK} strokeWidth="1.3" strokeDasharray="2 6" strokeLinecap="round" />
        <path d="M 22 -22 Q 40 -8 38 18" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
        <path d="M -30 0 Q -34 40 -10 64" fill="none" stroke="#B9824F" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
        {/* head */}
        <g transform="translate(-2 -44)">
          <circle r="31" fill="#FFF5E6" stroke={INK} strokeWidth="2.6" />
          <path d="M -9 -30 A 31 31 0 0 1 24 -20" fill="none" stroke="#FFE0A0" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <ellipse cx="-17" cy="8" rx="14" ry="22" fill="#E7C9AE" opacity="0.4" />
          <path d="M 0 -30 C -3 -42 8 -50 15 -44 C 21 -38 13 -28 7 -34 C 3 -38 8 -42 11 -40" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          {blink ? (
            <path d="M -15 -2 Q -9 3 -3 -2 M 6 -2 Q 12 3 18 -2" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <><ellipse cx="-10" cy="-2" rx="3" ry="4" fill={INK} /><ellipse cx="12" cy="-2" rx="3" ry="4" fill={INK} /></>
          )}
          <path d="M -9 -12 Q -6 -14 -2 -12 M 8 -12 Q 11 -14 15 -12" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M -3 12 Q 2 16 7 12" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="-19" cy="9" rx="6" ry="3.6" fill="#F27C8C" opacity="0.5" /><ellipse cx="22" cy="9" rx="6" ry="3.6" fill="#F27C8C" opacity="0.5" />
        </g>
      </g>
    </svg>
  );
}

// same plane size as CutoutCharacter (REGION 360x320 svg units, 2/302 world per unit)
const U = 2 / 392;
export const BabyProp: React.FC<{ tex: THREE.Texture | null; position: [number, number, number]; scale?: number; time: number; rock?: number }> = ({ tex, position, scale = 1, time, rock = 1 }) => {
  if (!tex) return null;
  const sway = Math.sin(time * 1.1) * 0.035 * rock;
  const breath = 1 + 0.018 * Math.sin((time * 2 * Math.PI) / 2.6);
  return (
    <group position={position} rotation={[0, 0, sway]} scale={[scale, scale * breath, scale]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[360 * U, 320 * U]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} color={new THREE.Color(1.05, 1.05, 1.05)} />
      </mesh>
    </group>
  );
};
