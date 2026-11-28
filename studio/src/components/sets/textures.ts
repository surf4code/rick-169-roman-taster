import * as THREE from "three";
import { mulberry32 } from "../../utils/anim";

/** Synchronous canvas textures (no async load = nothing for the frame capture to miss). */
function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, repeat: [number, number]) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export type WallKind = "fresco" | "brick" | "plaster" | "stone";
export type FloorKind = "mosaic" | "slabs" | "terracotta" | "planks";

export function wallTexture(kind: WallKind, repeatX: number, night = false): THREE.CanvasTexture {
  if (kind === "plaster" || kind === "stone") {
    const stone = kind === "stone";
    return canvasTex(512, 512, (c, w, h) => {
      const r = mulberry32(stone ? 19 : 23);
      c.fillStyle = stone ? "#8E9BBD" : "#EBD6AE"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) { c.fillStyle = stone ? `rgba(60,70,110,${0.04 + r() * 0.07})` : `rgba(150,110,60,${0.04 + r() * 0.07})`; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 60, 12 + r() * 40, r() * 3, 0, 7); c.fill(); }
      const bh = stone ? 64 : 30, bw = stone ? 128 : 72;                       // exposed blocks / brick patches
      const patches: [number, number, number, number][] = stone ? [[0, 0, 512, 512]] : [[40, 300, 200, 170], [330, 60, 150, 140]];
      for (const [px, py, pw, ph] of patches) for (let row = 0; row * bh < ph; row++) for (let col = -1; col * bw < pw; col++) {
        const x = px + col * bw + (row % 2 ? bw / 2 : 0); const v = (r() - 0.5) * 28;
        const cx = Math.max(px, x + 2), cw = Math.min(px + pw, x + bw - 2) - cx; if (cw <= 0) continue;
        c.fillStyle = stone ? `rgb(${142 + v},${155 + v},${189 + v})` : `rgb(${190 + v},${112 + v * 0.7},${78 + v * 0.5})`;
        c.fillRect(cx, py + row * bh + 2, cw, bh - 4);
      }
      c.strokeStyle = stone ? "rgba(40,50,90,0.45)" : "rgba(80,40,25,0.4)"; c.lineWidth = 3;
      if (stone) for (let row = 0; row <= h / bh; row++) { c.beginPath(); c.moveTo(0, row * bh); c.lineTo(w, row * bh); c.stroke(); }
    }, [repeatX, 2.4]);
  }
  if (kind === "brick") {
    return canvasTex(512, 512, (c, w, h) => {
      const r = mulberry32(7);
      c.fillStyle = "#B9825A"; c.fillRect(0, 0, w, h);
      const bh = 32, bw = 80;
      for (let row = 0; row < h / bh; row++) {
        for (let col = -1; col < w / bw + 1; col++) {
          const x = col * bw + (row % 2 ? bw / 2 : 0);
          const base = [196, 128, 88];
          const v = (r() - 0.5) * 34;
          c.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.7},${base[2] + v * 0.5})`;
          c.fillRect(x + 2, row * bh + 2, bw - 4, bh - 4);
        }
      }
      c.strokeStyle = "rgba(60,30,20,0.35)"; c.lineWidth = 3;
      for (let row = 0; row <= h / bh; row++) { c.beginPath(); c.moveTo(0, row * bh); c.lineTo(w, row * bh); c.stroke(); }
    }, [repeatX, 2.4]);
  }
  // fresco: one tile = 3 world units wide x 7 tall
  return canvasTex(512, 1024, (c, w, h) => {
    const u = h / 7;
    c.fillStyle = night ? "#C98A4E" : "#E3A94F"; c.fillRect(0, 0, w, h);                       // ochre field
    c.fillStyle = "#9E2F25"; c.fillRect(0, h - 1.5 * u, w, 1.5 * u);                                 // red dado
    c.fillStyle = "#E7B833"; c.fillRect(0, h - 1.56 * u, w, 0.06 * u);                              // gold rule
    c.fillStyle = "#F4E6C3"; c.fillRect(0, 0.2 * u, w, 1.0 * u);                                     // frieze
    c.fillStyle = "#2E7D80";                                                                         // meander squares
    for (let x = 0; x < w; x += 42) { c.fillRect(x + 6, 0.45 * u, 22, 0.1 * u); c.fillRect(x + 6, 0.45 * u, 0.1 * u, 0.4 * u); c.fillRect(x + 6, 0.8 * u, 22, 0.1 * u); }
    c.strokeStyle = "#F4E6C3"; c.lineWidth = 8;                                                      // painted panel
    c.strokeRect(70, 1.7 * u, w - 140, 3.4 * u);
    c.strokeStyle = "#9E2F25"; c.lineWidth = 4; c.strokeRect(84, 1.7 * u + 14, w - 168, 3.4 * u - 28);
    c.fillStyle = "#5B8C45";                                                                          // garland
    for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(100 + i * 38, 2.3 * u + Math.sin(i * 0.7) * 10, 15, 0, 7); c.fill(); }
    c.fillStyle = "#C93A2E"; for (let i = 0; i < 9; i += 2) { c.beginPath(); c.arc(100 + i * 38, 2.3 * u + Math.sin(i * 0.7) * 10, 7, 0, 7); c.fill(); }
    c.fillStyle = "#2E7D80"; c.beginPath(); c.arc(w / 2, 3.7 * u, 62, 0, 7); c.fill();               // medallion
    c.fillStyle = "#F4E6C3"; c.beginPath(); c.arc(w / 2, 3.7 * u, 40, 0, 7); c.fill();
    c.fillStyle = "#9E2F25"; c.beginPath(); c.arc(w / 2, 3.7 * u, 18, 0, 7); c.fill();
    c.fillStyle = "#7B1E1E"; c.fillRect(0, 0, w, 0.2 * u);
  }, [repeatX, 1]);
}

export function floorTexture(kind: FloorKind, repeat: [number, number]): THREE.CanvasTexture {
  return canvasTex(512, 512, (c, w, h) => {
    const r = mulberry32(11);
    if (kind === "mosaic") {
      const n = 4, s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? "#E5A64A" : "#F6E9CC"; c.fillRect(i * s, j * s, s, s);
        c.fillStyle = (i + j) % 2 ? "#B5452F" : "#2E7D80"; c.beginPath(); c.moveTo(i * s + s / 2, j * s + 20); c.lineTo(i * s + s - 20, j * s + s / 2); c.lineTo(i * s + s / 2, j * s + s - 20); c.lineTo(i * s + 20, j * s + s / 2); c.fill(); }
      c.strokeStyle = "rgba(80,50,30,0.35)"; c.lineWidth = 3; for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, h); c.stroke(); c.beginPath(); c.moveTo(0, i * s); c.lineTo(w, i * s); c.stroke(); }
    } else if (kind === "slabs") {
      c.fillStyle = "#D9BE92"; c.fillRect(0, 0, w, h);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) { const v = (r() - 0.5) * 26; c.fillStyle = `rgb(${226 + v},${200 + v},${158 + v})`; c.fillRect(col * 256 + (row % 2 ? 128 : 0) - 128 + 4, row * 128 + 4, 248, 120); c.fillRect(col * 256 + (row % 2 ? 128 : 0) + 4, row * 128 + 4, 248, 120); }
      c.strokeStyle = "rgba(90,60,40,0.4)"; c.lineWidth = 4; for (let row = 0; row <= 4; row++) { c.beginPath(); c.moveTo(0, row * 128); c.lineTo(w, row * 128); c.stroke(); }
    } else if (kind === "terracotta") {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = (r() - 0.5) * 30; c.fillStyle = `rgb(${196 + v},${112 + v * 0.7},${72 + v * 0.5})`; c.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); }
    } else {
      for (let i = 0; i < 6; i++) { const v = (r() - 0.5) * 30; c.fillStyle = `rgb(${176 + v},${122 + v},${76 + v * 0.6})`; c.fillRect(0, i * 86 + 2, w, 82); }
      c.strokeStyle = "rgba(60,36,20,0.4)"; c.lineWidth = 3; for (let i = 0; i <= 6; i++) { c.beginPath(); c.moveTo(0, i * 86); c.lineTo(w, i * 86); c.stroke(); }
    }
  }, repeat);
}

const vistaCache: Record<string, THREE.CanvasTexture> = {};
/** Painted distant view (sky, hills, Roman rooftops, cypress) shown through arches. Portrait 1:2. */
export function vistaTexture(night: boolean): THREE.CanvasTexture {
  const key = night ? "n" : "d";
  if (vistaCache[key]) return vistaCache[key];
  const t = canvasTex(512, 1024, (c, w, h) => {
    const r = mulberry32(night ? 3 : 4);
    const g = c.createLinearGradient(0, 0, 0, h);
    if (night) { g.addColorStop(0, "#2C3C86"); g.addColorStop(0.55, "#5C74C4"); g.addColorStop(1, "#E7A56A"); }
    else { g.addColorStop(0, "#7FC4EC"); g.addColorStop(0.5, "#CDEBF5"); g.addColorStop(0.8, "#FFE7B8"); g.addColorStop(1, "#FFD9A0"); }
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (night) { c.fillStyle = "#FFF6D8"; c.beginPath(); c.arc(380, 200, 46, 0, 7); c.fill(); for (let i = 0; i < 40; i++) { c.fillRect(r() * w, r() * h * 0.5, 3, 3); } }
    else { const sg = c.createRadialGradient(380, 260, 10, 380, 260, 220); sg.addColorStop(0, "rgba(255,250,214,1)"); sg.addColorStop(1, "rgba(255,250,214,0)"); c.fillStyle = sg; c.fillRect(0, 0, w, h);
      c.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i < 5; i++) { const x = r() * w, y = 120 + r() * 300; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + k * 34, y + (k % 2) * 8, 46, 20, 0, 0, 7); c.fill(); } } }
    const layer = (y: number, col: string, amp: number, f: number) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x * f + y) * amp + Math.sin(x * f * 2.3) * amp * 0.4); c.lineTo(w, h); c.fill(); };
    layer(600, night ? "#46579A" : "#A9B9D8", 26, 0.011);
    layer(650, night ? "#3A4A86" : "#8FAE9A", 22, 0.015);
    for (let i = 0; i < 7; i++) {                                    // distant buildings
      const bx = 20 + i * 70 + r() * 20, bw = 46 + r() * 30, bh = 60 + r() * 90, by = 720 - bh;
      c.fillStyle = night ? "#6E5A7E" : "#F0DDBF"; c.fillRect(bx, by, bw, bh);
      c.fillStyle = night ? "#4D4570" : "#C75A3A"; c.beginPath(); c.moveTo(bx - 4, by); c.lineTo(bx + bw / 2, by - 24); c.lineTo(bx + bw + 4, by); c.fill();
      c.fillStyle = night ? "#FFC863" : "#8A5B38"; for (let k = 0; k < 3; k++) c.fillRect(bx + 8 + k * 14, by + 18, 8, 14);
    }
    c.fillStyle = night ? "#6E5A7E" : "#F6EBD2"; c.fillRect(300, 560, 150, 110); c.fillStyle = night ? "#4D4570" : "#C75A3A"; c.beginPath(); c.moveTo(290, 560); c.lineTo(375, 505); c.lineTo(460, 560); c.fill();
    c.fillStyle = night ? "#5C4A70" : "#FFF8E8"; for (let k = 0; k < 6; k++) c.fillRect(310 + k * 24, 566, 12, 100);
    layer(740, night ? "#2F6A4C" : "#6FA855", 16, 0.02);
    for (let i = 0; i < 9; i++) { const x = r() * w, y = 700 + r() * 60; c.fillStyle = night ? "#1E4B3A" : "#3E7D3A"; c.beginPath(); c.ellipse(x, y - 40, 10, 48, 0, 0, 7); c.fill(); }
    layer(860, night ? "#3A7A4F" : "#8BBF63", 14, 0.025);
  }, [1, 1]);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  vistaCache[key] = t;
  return t;
}

/* ───────────────── Miko-flat set surfaces: big flat shapes, low contrast, thin ink lines, no brick / meander ───────────────── */
export interface MikoPalette { wall: string; wallLit: string; dado: string; floor: string; floorB: string; ink: string; bg: string; fog: string; hemiSky: string; }
export const MIKO_PALETTES: Record<string, MikoPalette> = {
  // warm dusk (plum + amber)
  palace_quarters_day: { wall: "#6A4560", wallLit: "#86596A", dado: "#4B2E4A", floor: "#5C3B42", floorB: "#6A4448", ink: "#1D1524", bg: "#2C1A28", fog: "#38222F", hemiSky: "#9378B8" },
  // cool teal corridor
  palace_corridor_day: { wall: "#3E6A74", wallLit: "#548489", dado: "#2A4A58", floor: "#3B4D5E", floorB: "#455A6A", ink: "#14202A", bg: "#16242E", fog: "#1E3340", hemiSky: "#6FA6BC" },
  // warm red banquet
  banquet_hall_day: { wall: "#7A4A3F", wallLit: "#94604A", dado: "#582F34", floor: "#6B4A44", floorB: "#785650", ink: "#231519", bg: "#2A1618", fog: "#3A2022", hemiSky: "#B88A7A" },
  palace_kitchen_day: { wall: "#6E4A3A", wallLit: "#8A6044", dado: "#4C3030", floor: "#62423A", floorB: "#6E4C42", ink: "#221518", bg: "#2A1A18", fog: "#3A2420", hemiSky: "#B58B70" },
  palace_kitchen_night: { wall: "#3E4A74", wallLit: "#55639A", dado: "#2A3052", floor: "#343C60", floorB: "#3E476E", ink: "#10142A", bg: "#141830", fog: "#1C2240", hemiSky: "#7A8CD0" },
};
export const mikoPalette = (setId: string): MikoPalette => MIKO_PALETTES[setId] || MIKO_PALETTES.palace_quarters_day;

/** Flat painted wall tile (3 world units wide x 7 tall): soft light patch, dado band, one big panel, thin ink lines. */
export function mikoWallTexture(p: MikoPalette, repeatX: number): THREE.CanvasTexture {
  return canvasTex(512, 1024, (c, w, h) => {
    const u = h / 7;
    c.fillStyle = p.wall; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,200,140,0.20)"); g.addColorStop(0.55, "rgba(255,200,140,0.0)"); g.addColorStop(1, "rgba(20,10,30,0.18)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = p.dado; c.fillRect(0, h - 2.1 * u, w, 2.1 * u);                       // dado band
    c.fillStyle = p.wallLit; c.fillRect(46, 1.5 * u, w - 92, 3.3 * u);                  // one big flat panel
    c.strokeStyle = p.ink; c.lineWidth = 5; c.globalAlpha = 0.7;
    c.strokeRect(46, 1.5 * u, w - 92, 3.3 * u);
    c.beginPath(); c.moveTo(0, h - 2.1 * u); c.lineTo(w, h - 2.1 * u); c.stroke();
    c.globalAlpha = 1;
  }, [repeatX, 1]);
}
export function mikoFloorTexture(p: MikoPalette, repeat: [number, number]): THREE.CanvasTexture {
  return canvasTex(512, 512, (c, w, h) => {
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? p.floor : p.floorB; c.fillRect(0, i * 128, w, 128); }
    c.strokeStyle = p.ink; c.globalAlpha = 0.55; c.lineWidth = 4;
    for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * 128); c.lineTo(w, i * 128); c.stroke(); }
    c.globalAlpha = 1;
  }, repeat);
}
