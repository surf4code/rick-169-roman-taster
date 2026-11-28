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
        <path d="M -34 -6 Q -40 52 -4 70 Q 34 70 40 18 Q 42 -14 30 -24 Q 0 -34 -34 -6 Z" fill={wrap} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M -34 6 Q 0 26 40 8 M -30 30 Q 2 48 38 30" fill="none" stroke={band} strokeWidth="6" strokeLinecap="round" />
        <path d="M -34 6 Q 0 26 40 8 M -30 30 Q 2 48 38 30" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="2 6" strokeLinecap="round" />
        <path d="M 22 -22 Q 40 -8 38 18" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
        <path d="M -30 0 Q -34 40 -10 64" fill="none" stroke="#7A5A8C" strokeOpacity="0.35" strokeWidth="8" strokeLinecap="round" />
        {/* baby's own fist peeking out of the swaddle */}
        <circle cx="30" cy="-14" r="10" fill="#FFF5E6" stroke={INK} strokeWidth="3.2" />
        {/* head: bigger, Miko ring + gold rim on the lit (left) side */}
        <g transform="translate(-2 -48)">
          <path d="M -40 -1.2 A 37.6 37.6 0 1 0 35.2 -1.2 A 37.6 37.6 0 1 0 -40 -1.2 Z M -36 0 A 36 36 0 1 0 36 0 A 36 36 0 1 0 -36 0 Z" fill="#F6B84E" fillRule="evenodd" opacity="0.95" />
          <circle r="34" fill="#FFF5E6" stroke={INK} strokeWidth="3.4" />
          <ellipse cx="18" cy="10" rx="14" ry="24" fill="#B59CC8" opacity="0.28" />
          <path d="M 0 -34 C -3 -46 8 -54 15 -48 C 21 -42 13 -32 7 -38 C 3 -42 8 -46 11 -44" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          {blink ? (
            <path d="M -16 2 Q -10 6 -4 2 M 6 2 Q 12 6 18 2" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="-10" cy="2" rx="3.6" ry="4.6" fill={INK} /><ellipse cx="12" cy="2" rx="3.6" ry="4.6" fill={INK} />
              <circle cx="-8.8" cy="0" r="1.3" fill="#FFFFFF" /><circle cx="13.2" cy="0" r="1.3" fill="#FFFFFF" />
            </>
          )}
          <path d="M -10 -9 Q -6 -11 -2 -9 M 8 -9 Q 12 -11 16 -9" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M -3 15 Q 2 18 7 15" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="-21" cy="13" rx="6.5" ry="3.8" fill="#F27C8C" opacity="0.55" /><ellipse cx="24" cy="13" rx="6.5" ry="3.8" fill="#F27C8C" opacity="0.55" />
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
