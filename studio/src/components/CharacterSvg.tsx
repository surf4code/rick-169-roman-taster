import React from "react";
import charactersData from "../data/characters.json";
import { EMOTION_LIBRARY, EmotionName } from "../utils/emotions";

export type CharacterId = keyof typeof charactersData.cast;

export interface CharacterSvgProps {
  characterId: CharacterId;
  emotion: EmotionName;
  rmsAmplitude?: number;
  spectralCentroid?: number;
  isBlinking?: boolean;
  breathY?: number;
  talkNod?: number;
  width?: number;
  height?: number;
  uid?: string;
  layer?: "all" | "lower" | "armB" | "torso" | "armF" | "head";
  turn?: number; // -1..1 head 3/4 turn (face features slide + compress)
}

const INK = "#231A29";
/** Brush-ink ring around a closed contour: width varies with the light side (heavy lower-left, thin upper-right) + hand wobble.
 *  Rendered as a FILLED ring (two subpaths, evenodd) so it antialiases like a brush stroke, not a uniform CSS stroke. */
const brushRing = (pts: [number, number][], base: number, heavy: number, seed: number): string => {
  const n = pts.length, L = [0.6, -0.8];
  const outer: string[] = [], inner: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], p = pts[i];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let nx = ty, ny = -tx; // outward for clockwise-in-screen contours
    const cx = pts.reduce((m, q) => m + q[0], 0) / n, cy = pts.reduce((m, q) => m + q[1], 0) / n;
    if ((p[0] - cx) * nx + (p[1] - cy) * ny < 0) { nx = -nx; ny = -ny; }
    const sh = 0.5 - 0.5 * (nx * L[0] + ny * L[1]);
    const th = (i / n) * Math.PI * 2;
    const w = base + heavy * sh * sh + 0.5 * Math.sin(3 * th + seed) + 0.35 * Math.sin(7 * th + seed * 2);
    outer.push(`${(p[0] + nx * w * 0.5).toFixed(2)} ${(p[1] + ny * w * 0.5).toFixed(2)}`);
    inner.push(`${(p[0] - nx * w * 0.5).toFixed(2)} ${(p[1] - ny * w * 0.5).toFixed(2)}`);
  }
  return `M ${outer.join(" L ")} Z M ${inner.join(" L ")} Z`;
};
const roundRectPts = (x: number, y: number, w: number, h: number, r: number): [number, number][] => {
  const pts: [number, number][] = [], seg = 14;
  const corners: [number, number, number][] = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  corners.forEach(([cx, cy, a0]) => { for (let k = 0; k <= seg; k++) { const a = a0 + (k / seg) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } });
  return pts;
};
/* hand-drawn head contour (measured from reference: slightly pointed crown, fuller jaw, chin taper, ~10% asymmetry) */
const headGeom = (a: number, b: number, seed: number) => {
  const N = 72, nTop = 1.75, nBot = 2.25, egg = -0.12, asym = seed % 2 ? 0.08 : -0.08, rot = ((seed % 7) - 3) * 0.012;
  const pts: [number, number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t), n = sn < 0 ? nTop : nBot;
    let X = Math.sign(c) * Math.pow(Math.abs(c), 2 / n), Y = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / n);
    X *= (1 + egg * Y) * (1 + asym * Math.sign(X));
    const x = a * X, y = b * Y, xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot);
    pts.push([xr, yr - 6, t]);
  }
  const full = "M " + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L ") + " Z";
  const thick = "M " + pts.filter((q) => q[2] > 0.2 && q[2] < 2.0).map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L ");
  return { full, thick, pts: pts.map((q) => [q[0], q[1]] as [number, number]) };
};
const hashId = (id: string) => id.split("").reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
/** Closed-mouth shape per emotion so faces read the situation even when nobody is talking. */
const CLOSED_MOUTH: Record<string, string> = {
  neutral: "M -9 16 Q 0 18 9 16",
  curious: "M -8 17 Q 2 20 10 12",
  talking_animated: "M -12 12 Q 0 26 12 12",
  skeptical: "M -9 18 L 9 13",
  happy_relief: "M -15 11 Q 0 30 15 11",
  nervous_sweat: "M -12 17 Q -6 11 0 17 Q 6 23 12 17",
  focused_reading: "M -8 16 L 8 16",
  confident_point: "M -10 16 Q 3 24 13 11",
  embarrassed_blush: "M -8 16 Q 0 21 8 16",
  sad_slump: "M -12 22 Q 0 9 12 22",
  angry_glare: "M -12 20 Q 0 12 12 20",
  thinking_chin: "M -7 17 Q 3 14 11 18",
  shrug_question: "M -11 18 Q -3 12 4 17 Q 9 21 12 15",
  celebrate_arms_up: "M -15 10 Q 0 32 15 10",
};
const GOLD = "#E7B833";

/* ---------------- hair / headgear (drawn on top of the head, head centre = 0,-6) ---------------- */
const Hair: React.FC<{ style: string; c: string; accent: string }> = ({ style, c, accent }) => {
  const sw = 4;
  const shine = <path d="M -26 -44 Q -10 -52 6 -46" fill="none" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="5" strokeLinecap="round" />;
  switch (style) {
    case "messy_tuft": // taster: spiky quiff + cowlick
      return (<>
        <path d="M -49 -12 L -46 -36 L -35 -33 L -31 -55 L -19 -44 L -9 -64 L 3 -47 L 15 -62 L 22 -45 L 37 -54 L 39 -37 L 50 -34 L 49 -12 Q 32 -33 0 -31 Q -32 -33 -49 -12 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -8 -58 Q -4 -46 2 -40 M 16 -56 Q 18 -46 14 -38" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
      </>);
    case "tied_bun": // mother / maid: parted hair, headband, high bun
      return (<>
        <circle cx="0" cy="-58" r="17" fill={c} stroke={INK} strokeWidth={sw} />
        <path d="M -8 -60 Q 0 -52 8 -60" fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="3" />
        <path d="M -50 -12 Q -52 -52 0 -52 Q 52 -52 50 -12 Q 34 -36 0 -33 Q -34 -36 -50 -12 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M 0 -52 L 0 -34" stroke="#000" strokeOpacity="0.3" strokeWidth="2.6" />
        <path d="M -49 -22 Q 0 -44 49 -22" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <path d="M -49 -22 Q 0 -44 49 -22" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 7" />
      </>);
    case "ring_stubble": // Halotus: tonsure ring, tufts, thin grey crown strands
      return (<>
        <path d="M -52 -10 C -58 -34, -38 -42, -32 -22 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        <path d="M 52 -10 C 58 -34, 38 -42, 32 -22 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        <path d="M -30 -46 Q -34 -50 -24 -50 M 24 -50 Q 34 -50 30 -46" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" />
        {shine}
      </>);
    case "wispy": // Claudius: white wisps + big side tufts
      return (<>
        <path d="M -53 -6 C -62 -34, -38 -44, -34 -20 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        <path d="M 53 -6 C 62 -34, 38 -44, 34 -20 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        <path d="M -22 -50 Q -8 -66 4 -52 M -4 -52 Q 12 -68 22 -52 M 8 -50 Q 20 -58 28 -46" fill="none" stroke={c} strokeWidth="3.6" strokeLinecap="round" />
        <path d="M -22 -50 Q -8 -66 4 -52 M -4 -52 Q 12 -68 22 -52" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {shine}
      </>);
    case "side_buns": // Agrippina: centre-parted waves, rolled buns, gold diadem with ruby
      return (<>
        <circle cx="-48" cy="-24" r="14" fill={c} stroke={INK} strokeWidth={sw} />
        <circle cx="48" cy="-24" r="14" fill={c} stroke={INK} strokeWidth={sw} />
        <path d="M -52 -24 Q -48 -30 -44 -24 Q -48 -18 -52 -22 M 44 -24 Q 48 -30 52 -24 Q 48 -18 44 -22" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2.4" />
        <path d="M -52 -8 Q -58 -50 0 -54 Q 58 -50 52 -8 Q 44 -30 24 -34 Q 4 -30 0 -40 Q -4 -30 -24 -34 Q -44 -30 -52 -8 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -42 -40 Q 0 -60 42 -40" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="-46" r="5.5" fill="#D01C3C" stroke={INK} strokeWidth="2.2" />
      </>);
    case "curly_laurel": // Nero: two rows of curls + laurel leaves
      return (<>
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => <circle key={`a${k}`} cx={k * 9.6} cy={-34 + Math.abs(k) * 3.2 + (Math.abs(k) > 3 ? 4 : 0)} r="9.5" fill={c} stroke={INK} strokeWidth="3" />)}
        {[-4, -2, 0, 2, 4].map((k) => <circle key={`b${k}`} cx={k * 10} cy={-50 + Math.abs(k) * 1.6} r="10.5" fill={c} stroke={INK} strokeWidth="3" />)}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => <ellipse key={`l${k}`} cx={k * 10.4} cy={-30 + Math.abs(k) * 3.3} rx="6.5" ry="3.4" fill="#6BA83F" stroke={INK} strokeWidth="1.8" transform={`rotate(${k * 12} ${k * 10.4} ${-30 + Math.abs(k) * 3.3})`} />)}
      </>);
    case "boy_cut": // Britannicus / servant: side-swept fringe
      return (<>
        <path d="M -50 -10 Q -54 -54 0 -54 Q 54 -54 50 -10 Q 46 -28 36 -30 L 28 -22 L 14 -32 L 2 -22 L -12 -32 L -26 -24 L -36 -32 Q -46 -28 -50 -10 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        {shine}
      </>);
    case "crop": // servant_a: neat short crop, straight fringe
      return (<>
        <path d="M -51 -6 Q -56 -52 0 -53 Q 56 -52 51 -6 L 47 -22 Q 0 -40 -47 -22 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      </>);
    case "spiky_anime": // Akira: black spiky anime hair
      return (<>
        <path d="M -52 -8 L -56 -34 L -42 -30 L -44 -56 L -28 -44 L -22 -70 L -10 -48 L 2 -72 L 12 -48 L 26 -68 L 30 -44 L 46 -56 L 44 -30 L 58 -34 L 52 -8 Q 34 -34 0 -32 Q -34 -34 -52 -8 Z" fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -12 -56 L -6 -44 M 10 -58 L 12 -46 M 28 -52 L 24 -42" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      </>);
    case "hood": // Locusta: deep cowl with inner shadow
      return (<>
        <path d="M -62 12 Q -70 -66 0 -72 Q 70 -66 62 12 Q 56 -28 0 -30 Q -56 -28 -62 12 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M -52 4 Q -56 -34 0 -36 Q 56 -34 52 4 Q 40 -22 0 -24 Q -40 -22 -52 4 Z" fill="#0C1A14" opacity="0.55" />
        <path d="M -10 -70 L 0 -78 L 10 -70" fill={c} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
      </>);
    case "cook_cap":
      return (<>
        <path d="M -34 -38 Q -44 -62 -22 -72 Q -8 -84 6 -74 Q 28 -78 34 -58 Q 40 -44 34 -38 Z" fill="#FAFAF5" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="-46" y="-44" width="92" height="13" rx="6" fill="#FAFAF5" stroke={INK} strokeWidth={sw} />
        <path d="M -18 -66 Q -14 -52 -16 -46 M 8 -70 Q 12 -56 10 -46" fill="none" stroke="#000" strokeOpacity="0.14" strokeWidth="3" />
      </>);
    case "bald_ring": // scribe
      return (<>
        <path d="M -52 -12 C -56 -34, -38 -38, -34 -20 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        <path d="M 52 -12 C 56 -34, 38 -38, 34 -20 Z" fill={c} stroke={INK} strokeWidth="3.4" />
        {shine}
      </>);
    case "helmet_crest": // praetorian: helmet, cheek guards, plume
      return (<>
        <path d="M -52 -14 A 52 46 0 0 1 52 -14 Z" fill="#D6A64E" stroke={INK} strokeWidth="4.6" />
        <path d="M -52 -14 L -56 20 Q -46 30 -40 22 L -40 -10 Z M 52 -14 L 56 20 Q 46 30 40 22 L 40 -10 Z" fill="#C29538" stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
        <rect x="-54" y="-36" width="108" height="9" rx="4" fill="#B8862F" stroke={INK} strokeWidth="3.2" />
        <path d="M -20 -48 Q 0 -90 22 -48 Z" fill="#D41C24" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M -10 -52 Q 0 -74 10 -52 M 0 -54 L 0 -72" fill="none" stroke="#7F1018" strokeWidth="2.4" />
        <path d="M -28 -44 Q -16 -56 -6 -46" fill="none" stroke="#FFF3D4" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
      </>);
    default:
      return null;
  }
};

/* ---------------- sleeves (move with the arm) ---------------- */
const Sleeve: React.FC<{ side: 1 | -1; outfit: string; shirt: string; accent: string }> = ({ side, outfit, shirt, accent }) => {
  if (outfit === "cuirass") return <><circle cx="0" cy="2" r="17" fill="#D6A64E" stroke={INK} strokeWidth="4" /><path d="M -10 -2 Q 0 -10 10 -2" fill="none" stroke="#FFF3D4" strokeOpacity="0.5" strokeWidth="3" /></>;
  const long = outfit === "robe" || outfit === "toga";
  const len = long ? 30 : outfit === "stola" ? 12 : 17;
  return (
    <g>
      <path d={`M ${-14} -4 Q 0 -14 14 -4 L ${side * 3 + 14} ${len + 6} Q 0 ${len + 14} ${-14 + side * 3} ${len + 6} Z`} fill={shirt} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M ${-12 + side * 3} ${len + 2} Q 0 ${len + 10} ${12 + side * 3} ${len + 2}`} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
};

export const CharacterSvg: React.FC<CharacterSvgProps> = ({
  characterId, emotion, rmsAmplitude = 0, spectralCentroid = 0.5, isBlinking = false, breathY = 0, talkNod = 0, width = 280, height = 400, uid = "0", layer = "all", turn = 0,
}) => {
  const show = (l: string) => layer === "all" || layer === l;
  if (layer !== "all") { breathY = 0; talkNod = 0; }
  const spec = (charactersData.cast as Record<string, any>)[characterId] || charactersData.cast.taster_protagonist;
  const pose = EMOTION_LIBRARY[emotion] || EMOTION_LIBRARY.neutral;

  const isShock = emotion === "shocked" || emotion === "surprised_jump";
  const isHappy = emotion === "happy_relief" || emotion === "celebrate_arms_up";
  const isAngry = emotion === "angry_glare";
  const isSkeptical = emotion === "skeptical";

  let viseme: "closed" | "mid" | "open" | "o" = "closed";
  if (rmsAmplitude >= 0.14 && rmsAmplitude < 0.42) viseme = "mid";
  else if (rmsAmplitude >= 0.42) viseme = spectralCentroid < 0.38 ? "o" : "open";

  const skin = "#FDFAF4";
  const shirt: string = spec.bodyColor;
  const accent: string = spec.accentColor;
  const hairC: string = spec.hairColor || "#4A3222";
  const outfit: string = spec.outfit || "tunic";
  const trim: string = spec.trim || "sash";
  const pattern: string = spec.pattern || "none";
  const facial: string = spec.facial || "none";
  const HEAD: Record<string, [number, number]> = { bean_egg: [52, 45], tall_bean: [50, 50], soft_oval: [50, 46], wide_bean: [55, 44], round_bean: [52, 48] };
  const [hx, hy] = HEAD[spec.headShape] || [52, 45];
  const hid = hashId(characterId);
  const pick = (k: number, m: number) => ((hid >>> k) % m);
  const T = {
    eyeRx: 4.6 + pick(1, 5) * 0.55, eyeRy: 0.9 + pick(3, 4) * 0.08, gap: 13.5 + pick(5, 5) * 1.3,
    browW: 3.8 + pick(7, 4) * 0.8, browLen: 14 + pick(9, 4) * 2.6, browTilt: (pick(11, 5) - 2) * 2.2, browY: -pick(13, 3) * 1.6,
    mouthS: 0.85 + pick(15, 4) * 0.1, mouthY: pick(17, 3) * 1.5 - 1,
    shock: pick(19, 5), happy: pick(21, 3),
  };
  const HG = headGeom(hx, hy, hid);
  const clipTorsoId = `torso-clip-${characterId}-${uid}`;
  const clipHeadId = `head-clip-${characterId}-${uid}`;
  const cloak = outfit === "cuirass" ? "#B91C1C" : outfit === "robe" ? "#16382B" : null;

  return (
    <svg width={width} height={height} viewBox="0 0 280 400" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={clipTorsoId}><rect x="-44" y="-58" width="88" height="118" rx="44" ry="44" /></clipPath>
        <clipPath id={clipHeadId}><path d={HG.full} /></clipPath>
      </defs>
      <g transform={`translate(140, ${228 + breathY}) rotate(${layer === "all" ? pose.torsoLeanDeg : 0})`}>
        {show("lower") && (<>
        {/* cape behind body */}
        {outfit === "cuirass" && <path d="M -40 -50 Q -70 20 -58 112 Q 0 124 58 112 Q 70 20 40 -50 Z" fill="#B91C1C" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />}

        {(outfit === "cuirass" || outfit === "tunic" || outfit === "apron") && [[-22, 100], [22, 100]].map(([x, y], i) => (
          <path key={i} d={`M ${x - 8} ${y - 6} Q ${x} ${y - 14} ${x + 8} ${y - 6}`} fill="none" stroke="#FFFFFF" strokeOpacity="0.0" />
        ))}

        {/* skirts / long garments (behind torso) */}
        {outfit === "stola" && (
          <g>
            <path d="M -42 28 L -62 108 Q 0 124 62 108 L 42 28 Z" fill={shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M -14 42 L -24 112 M 6 42 L 8 116 M 26 42 L 40 110" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="3.4" />
            <path d="M -61 98 Q 0 114 61 98 L 62 108 Q 0 124 -62 108 Z" fill={accent} stroke={INK} strokeWidth="3" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M ${-52 + i * 14} 106 h 8 v -5 h -4`} fill="none" stroke={shirt} strokeWidth="2.2" />)}
          </g>
        )}
        {outfit === "robe" && (
          <g>
            <path d="M -46 24 L -58 104 L -44 98 L -34 108 L -20 100 L -6 110 L 8 100 L 22 108 L 36 98 L 48 106 L 58 104 L 46 24 Z" fill={shirt} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M -20 40 L -26 100 M 4 40 L 4 104 M 26 40 L 34 100" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="3.4" />
          </g>
        )}
        {outfit === "toga" && (
          <g>
            <path d="M -44 30 L -56 100 Q 0 116 56 100 L 44 30 Z" fill="#F1EEF6" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M -10 44 Q -14 80 -8 108 M 12 44 Q 16 80 10 106 M 30 44 Q 38 76 34 102" fill="none" stroke="#8A7FA8" strokeOpacity="0.55" strokeWidth="3.2" />
            <path d="M -55 96 Q 0 112 55 96" fill="none" stroke={accent} strokeWidth="5" />
          </g>
        )}
        {outfit === "cuirass" && [-36, -18, 0, 18, 36].map((x, i) => (
          <rect key={i} x={x - 8} y="44" width="16" height="32" rx="5" fill="#C29538" stroke={INK} strokeWidth="3" />
        ))}

        </>)}
        {show("armB") && (<>
        </>)}
        {show("torso") && (<>
        {/* torso (clipped garment + cel shading) */}
        <g clipPath={`url(#${clipTorsoId})`}>
          <rect x="-44" y="-58" width="88" height="118" rx="44" fill={outfit === "apron" ? shirt : shirt} />

          {outfit === "tunic" && (
            <>
              {trim === "sash" && <path d="M -28 -58 L 28 60 L 42 54 L -12 -58 Z" fill={accent} stroke={INK} strokeWidth="2.8" />}
              {trim === "clavi" && (<>
                <rect x="-19" y="-58" width="11" height="118" fill={accent} stroke={INK} strokeWidth="2.2" />
                <rect x="8" y="-58" width="11" height="118" fill={accent} stroke={INK} strokeWidth="2.2" />
              </>)}
              {trim === "collar" && <path d="M -22 -58 Q 0 -30 22 -58" fill={accent} stroke={INK} strokeWidth="2.6" />}
              <path d="M -44 8 Q 0 26 44 8" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="3.4" />
              <rect x="-44" y="14" width="88" height="13" fill="#683C1C" stroke={INK} strokeWidth="2.8" />
              <rect x="-11" y="12" width="22" height="17" rx="3" fill="#ECBC3E" stroke={INK} strokeWidth="2.8" />
              <path d="M -16 -58 L 0 -38 L 16 -58" fill="none" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
            </>
          )}
          {outfit === "stola" && (
            <>
              <path d="M -16 -58 L 0 -34 L 16 -58 Z" fill="#F6E7CF" stroke={INK} strokeWidth="2.6" />
              <path d="M -44 -36 Q -6 -14 44 24 L 44 44 Q -6 10 -44 -12 Z" fill={accent} stroke={INK} strokeWidth="2.8" />
              <path d="M -30 -20 L -22 -2 M -12 -8 L -4 8 M 6 4 L 14 20" stroke="#000" strokeOpacity="0.22" strokeWidth="2.6" />
              <rect x="-44" y="2" width="88" height="7" fill={GOLD} stroke={INK} strokeWidth="2.4" />
              <circle cx="-30" cy="-46" r="5" fill={GOLD} stroke={INK} strokeWidth="2.2" />
              <circle cx="30" cy="-46" r="5" fill={GOLD} stroke={INK} strokeWidth="2.2" />
            </>
          )}
          {outfit === "toga" && (
            <>
              <path d="M -34 -58 Q 0 -26 44 30 L 44 54 Q -6 6 -48 -40 Z" fill="#E6E0F2" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
              <path d="M -48 -40 Q -6 6 44 54" fill="none" stroke={accent} strokeWidth="7" />
              <path d="M -20 -30 Q 4 -10 22 10 M -6 -40 Q 14 -22 34 -2" fill="none" stroke="#8A7FA8" strokeOpacity="0.5" strokeWidth="2.6" />
              <path d="M -20 -58 L 0 -40 L 20 -58" fill="none" stroke={INK} strokeWidth="2.6" />
            </>
          )}
          {outfit === "cuirass" && (
            <>
              <rect x="-44" y="-58" width="88" height="118" fill="#D6A64E" />
              <path d="M -2 -50 Q -26 -34 -22 -12 Q -8 -6 -2 -12 Z M 2 -50 Q 26 -34 22 -12 Q 8 -6 2 -12 Z" fill="#E7BE62" stroke={INK} strokeWidth="2.8" />
              <path d="M 0 -12 L 0 44" stroke={INK} strokeWidth="2.8" />
              {[2, 20, 38].map((y, i) => <path key={i} d={`M -40 ${y} Q 0 ${y + 8} 40 ${y}`} fill="none" stroke={INK} strokeWidth="2.8" />)}
              <rect x="-44" y="44" width="88" height="11" fill="#683C1C" stroke={INK} strokeWidth="2.6" />
              <circle cx="0" cy="50" r="7" fill={GOLD} stroke={INK} strokeWidth="2.4" />
              <path d="M -40 -38 L -30 -58 M 40 -38 L 30 -58" stroke="#FFF3D4" strokeOpacity="0.5" strokeWidth="3" />
            </>
          )}
          {outfit === "apron" && (
            <>
              <path d="M -22 -34 L 22 -34 L 32 62 L -32 62 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
              <path d="M -22 -34 L -30 -58 M 22 -34 L 30 -58" stroke={INK} strokeWidth="3.4" />
              <rect x="-16" y="16" width="32" height="20" rx="4" fill="none" stroke={INK} strokeWidth="2.4" />
              <path d="M -6 -8 Q 2 -14 8 -6 Q 4 2 -4 0 Z" fill="#C9462E" opacity="0.7" />
              <path d="M -32 8 L 32 8" stroke="#8A6B4B" strokeWidth="4" />
              <path d="M 0 8 L -8 22 M 0 8 L 8 22" stroke="#8A6B4B" strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {outfit === "robe" && (
            <>
              <path d="M -18 -58 L 0 -6 L 18 -58 Z" fill="#2E6B52" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M -22 -20 L -26 60 M 0 -10 L 0 60 M 22 -20 L 26 60" stroke="#000" strokeOpacity="0.3" strokeWidth="3.2" />
              <path d="M -44 14 Q 0 24 44 14" fill="none" stroke="#C9A86A" strokeWidth="5" />
              <circle cx="14" cy="22" r="4" fill="#C9A86A" stroke={INK} strokeWidth="2" />
            </>
          )}

          {pattern === "meander" && [0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M ${-42 + i * 13} 50 h 9 v -8 h -5 v 4`} fill="none" stroke={outfit === "stola" ? "#FFF3D4" : accent} strokeWidth="2.6" />
          ))}
          {pattern === "stripes" && [-30, -14, 2, 18, 34].map((x, i) => <line key={i} x1={x} y1="-50" x2={x} y2="56" stroke="#FFF3D4" strokeOpacity="0.45" strokeWidth="4" />)}
          {pattern === "dots" && [[-24, -10], [0, 4], [24, -10], [-12, 28], [14, 30], [-30, 40], [30, 42]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.6" fill={accent} />)}

          <ellipse cx="-38" cy="4" rx="34" ry="70" fill="#000000" opacity="0.16" />
          <ellipse cx="38" cy="-4" rx="18" ry="52" fill="#FFF3D4" opacity="0.24" />
        </g>
        <path d={brushRing(roundRectPts(-44, -58, 88, 118, 44), 3.2, 5.4, hid % 9)} fill={INK} fillRule="evenodd" />

        </>)}
        {show("armF") && (<>
        </>)}
        {show("head") && (<>
        {/* head */}
        <g transform={`translate(0, -84) rotate(${layer === "all" ? pose.headTiltDeg + talkNod : 0})`}>
          {[-1, 1].map((sd) => (
            <g key={`ear${sd}`}>
              <ellipse cx={sd * (hx - 1)} cy="-2" rx="8.5" ry="11.5" fill={skin} stroke={INK} strokeWidth="4" />
              <path d={`M ${sd * (hx - 1)} -7 Q ${sd * (hx + 3)} -2 ${sd * (hx - 1)} 4`} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ))}
          <g clipPath={`url(#${clipHeadId})`}>
            <path d={HG.full} fill={skin} />
            <ellipse cx="-50" cy="14" rx="30" ry="50" fill="#E3D9DD" opacity="0.55" />
            <ellipse cx="-46" cy="18" rx="20" ry="40" fill="#D6CAD1" opacity="0.45" />
            <ellipse cx="32" cy="-24" rx="22" ry="26" fill="#FFFFFF" opacity="0.45" />
          </g>
          <path d={brushRing(HG.pts, 3.4, 5.6, hid % 11)} fill={INK} fillRule="evenodd" />

          <Hair style={spec.hairStyle} c={hairC} accent={accent} />

          <g transform={`translate(${3.5 + turn * 11},0) scale(${1 - Math.abs(turn) * 0.14},1)`}>
          {/* eyes */}
          {isShock ? (
            T.shock === 0 ? (<>
              <ellipse cx={-T.gap} cy="-7" rx="11" ry="13" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" /><circle cx={-T.gap} cy="-7" r="3" fill={INK} />
              <ellipse cx={T.gap} cy="-7" rx="11" ry="13" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" /><circle cx={T.gap} cy="-7" r="3" fill={INK} />
            </>) : T.shock === 1 ? (<>
              <circle cx={-T.gap} cy="-6" r="7" fill={INK} /><circle cx={T.gap} cy="-6" r="7" fill={INK} />
              <circle cx={-T.gap + 2} cy="-9" r="2.2" fill="#FFFFFF" /><circle cx={T.gap + 2} cy="-9" r="2.2" fill="#FFFFFF" />
            </>) : T.shock === 2 ? (<>
              <circle cx={-T.gap - 1} cy="-8" r="12.5" fill="#FFFFFF" stroke={INK} strokeWidth="3.4" /><circle cx={-T.gap - 5} cy="-8" r="4" fill={INK} />
              <circle cx={T.gap + 1} cy="-8" r="12.5" fill="#FFFFFF" stroke={INK} strokeWidth="3.4" /><circle cx={T.gap - 3} cy="-8" r="4" fill={INK} />
            </>) : T.shock === 3 ? (<>
              <ellipse cx={-T.gap} cy="-6" rx="8" ry="15" fill="#FFFFFF" stroke={INK} strokeWidth="3.4" /><ellipse cx={-T.gap} cy="-2" rx="3.4" ry="5" fill={INK} />
              <ellipse cx={T.gap} cy="-6" rx="8" ry="15" fill="#FFFFFF" stroke={INK} strokeWidth="3.4" /><ellipse cx={T.gap} cy="-2" rx="3.4" ry="5" fill={INK} />
            </>) : (<>
              <path d={`M ${-T.gap - 9} -14 L ${-T.gap + 6} -7 L ${-T.gap - 9} 0`} fill="none" stroke={INK} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${T.gap + 9} -14 L ${T.gap - 6} -7 L ${T.gap + 9} 0`} fill="none" stroke={INK} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            </>)
          ) : isHappy ? (
            T.happy === 0 ? (<>
              <path d={`M ${-T.gap - 8} -6 Q ${-T.gap} -17 ${-T.gap + 8} -6`} fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
              <path d={`M ${T.gap - 8} -6 Q ${T.gap} -17 ${T.gap + 8} -6`} fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
            </>) : T.happy === 1 ? (<>
              <path d={`M ${-T.gap - 7} -9 Q ${-T.gap} -3 ${-T.gap + 7} -9`} fill="none" stroke={INK} strokeWidth="4.4" strokeLinecap="round" />
              <path d={`M ${T.gap - 7} -9 Q ${T.gap} -3 ${T.gap + 7} -9`} fill="none" stroke={INK} strokeWidth="4.4" strokeLinecap="round" />
            </>) : (<>
              <ellipse cx={-T.gap} cy="-7" rx="6" ry="8.5" fill={INK} /><circle cx={-T.gap + 2} cy="-10" r="2.2" fill="#fff" />
              <ellipse cx={T.gap} cy="-7" rx="6" ry="8.5" fill={INK} /><circle cx={T.gap + 2} cy="-10" r="2.2" fill="#fff" />
            </>)
          ) : (
            <>
              <ellipse cx={-T.gap} cy="-7" rx={T.eyeRx} ry={isBlinking ? 1.0 : 7.8 * T.eyeRy * pose.eyeScaleY} fill={INK} />
              <ellipse cx={T.gap} cy="-7" rx={T.eyeRx} ry={isBlinking ? 1.0 : 7.8 * T.eyeRy * pose.eyeScaleY} fill={INK} />
              {isSkeptical && (
                <>
                  <line x1="-25" y1="-11" x2="-7" y2="-11" stroke={INK} strokeWidth="3.8" />
                  <line x1="7" y1="-11" x2="25" y2="-11" stroke={INK} strokeWidth="3.8" />
                </>
              )}
            </>
          )}
          {facial === "eyebags" && (
            <>
              <path d="M -24 4 Q -16 10 -8 4 M 8 4 Q 16 10 24 4" fill="none" stroke="#6B6470" strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}

          {/* brows */}
          <line x1={-T.gap - T.browLen / 2} y1={-23 + T.browY} x2={-T.gap + T.browLen / 2} y2={-23 + T.browY} stroke={INK} strokeWidth={T.browW} strokeLinecap="round" transform={`rotate(${pose.browLeftDeg + T.browTilt}, ${-T.gap}, ${-23 + T.browY})`} />
          <line x1={T.gap - T.browLen / 2} y1={-23 + T.browY} x2={T.gap + T.browLen / 2} y2={-23 + T.browY} stroke={INK} strokeWidth={T.browW} strokeLinecap="round" transform={`rotate(${pose.browRightDeg + T.browTilt}, ${T.gap}, ${-23 + T.browY})`} />

          {/* mouth */}
          {isAngry ? (
            <rect x="-15" y="10" width="30" height="12" rx="5" fill="#FFFFFF" stroke={INK} strokeWidth="3.4" />
          ) : isShock && T.shock === 1 ? (
            <ellipse cx="0" cy="16" rx="6" ry="9" fill="#3A1218" stroke={INK} strokeWidth="3.4" />
          ) : isShock && T.shock === 3 ? (
            <path d="M -14 14 Q -7 8 0 14 Q 7 20 14 14" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          ) : isShock && T.shock === 4 ? (
            <g><path d="M -18 6 L 18 6 L 14 26 L -14 26 Z" fill="#3A1218" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" /><rect x="-13" y="7" width="26" height="5" fill="#FFFFFF" /></g>
          ) : isShock || viseme === "open" ? (
            <g transform={`scale(${T.mouthS}) translate(0 ${T.mouthY})`}>
              <path d="M -16 8 L 16 8 C 16 26, -16 26, -16 8 Z" fill="#3A1218" stroke={INK} strokeWidth="3.4" />
              <rect x="-12" y="9" width="24" height="5" rx="2" fill="#FFFFFF" />
              <ellipse cx="0" cy="21" rx="8" ry="4" fill="#EC5C72" />
            </g>
          ) : viseme === "mid" ? (
            <rect x="-12" y="10" width="24" height="10" rx="5" fill="#3A1218" stroke={INK} strokeWidth="3.2" />
          ) : viseme === "o" ? (
            <ellipse cx="0" cy="16" rx="8" ry="10" fill="#3A1218" stroke={INK} strokeWidth="3.4" />
          ) : (
            <path d={CLOSED_MOUTH[emotion] || CLOSED_MOUTH.neutral} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {pose.showBlush && (<><ellipse cx="-34" cy="8" rx="9" ry="5" fill="#F27C8C" opacity="0.55" /><ellipse cx="34" cy="8" rx="9" ry="5" fill="#F27C8C" opacity="0.55" /></>)}

          {/* facial hair (over mouth) */}
          {facial === "mustache" && <path d="M -22 8 Q -12 0 0 7 Q 12 0 22 8 Q 12 14 0 10 Q -12 14 -22 8 Z" fill={hairC} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
          {facial === "goatee" && <path d="M -8 24 Q 0 46 8 24 Q 0 30 -8 24 Z" fill={hairC} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
          {facial === "stubble" && [[-20, 18], [-12, 26], [0, 30], [12, 26], [20, 18], [-6, 22], [6, 22], [-26, 10], [26, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#5A5560" />)}

          </g>
          {pose.showSweatDrop && (
            <g transform="translate(38, -26)">
              <path d="M 0 -13 C 9 0, 9 11, 0 11 C -9 11, -9 0, 0 -13 Z" fill="#8EE0FF" stroke={INK} strokeWidth="2.8" />
              <circle cx="-2.5" cy="1" r="2" fill="#FFFFFF" />
            </g>
          )}
        </g>
        </>)}
      </g>
    </svg>
  );
};
