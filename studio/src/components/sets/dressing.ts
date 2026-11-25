import { mulberry32 } from "../../utils/anim";

type V3 = [number, number, number];
export interface Item { t: string; p: V3; r?: V3; s?: number; c?: string; o?: Record<string, any>; }
export interface SetSpec {
  items: Item[];
  wall: "fresco" | "brick" | "plaster" | "stone";
  floor: "mosaic" | "slabs" | "terracotta" | "planks";
  backZ: number; halfW: number; floorD: number; floorZ: number; wallH: number;
  night: boolean;
  torchLights: V3[];
  sky: string;
}

const PI = Math.PI;

function scatter(items: Item[], seed: number, n: number, x: [number, number], z: [number, number], types: string[], avoid: [number, number, number, number][] = []) {
  const rng = mulberry32(seed);
  let placed = 0, guard = 0;
  while (placed < n && guard++ < n * 20) {
    const px = x[0] + rng() * (x[1] - x[0]);
    const pz = z[0] + rng() * (z[1] - z[0]);
    if (avoid.some(([ax0, ax1, az0, az1]) => px > ax0 && px < ax1 && pz > az0 && pz < az1)) continue;
    const t = types[Math.floor(rng() * types.length)];
    items.push({ t, p: [px, 0, pz], r: [0, rng() * PI * 2, 0], s: 0.8 + rng() * 0.5 });
    placed++;
  }
}

/** Keep-clear zone for the characters (x0,x1,z0,z1). */
const STAGE: [number, number, number, number] = [-2.6, 2.6, -0.9, 1.0];

export function buildSet(setId: string): SetSpec {
  const items: Item[] = [];
  const add = (t: string, p: V3, o: Partial<Item> = {}) => items.push({ t, p, ...o });

  if (setId === "banquet_hall_day") {
    for (const x of [-5.2, -1.8, 1.8, 5.2]) add("Column", [x, 0, -3.3]);
    for (const x of [-6.0, 6.0]) { add("Column", [x, 0, -0.8], { o: { band: "#2E7D80" } }); add("Column", [x, 0, 2.2], { o: { band: "#2E7D80" } }); }
    for (const x of [-3.6, 0, 3.6]) add("Arch", [x, 0, -3.78]);
    for (const [x, c] of [[-1.8, "#B03A2E"], [1.8, "#2E7D80"], [-5.2, "#2E7D80"], [5.2, "#B03A2E"]] as [number, string][]) add("Banner", [x, 4.9, -3.6], { c });
    for (const x of [-6.6, 6.6]) add("Torch", [x, 2.3, -3.6]);
    add("Rug", [0, 0, -0.9], { c: "#B8352C", o: { w: 6.4, d: 3.6, border: "#2E5F73" } });
    add("Rug", [0, 0, 1.9], { c: "#2E7D80", o: { w: 3.4, d: 1.4, border: "#E7B833" } });
    add("Table", [0, 0, -1.7], { o: { w: 2.6, d: 0.9, h: 0.8 } });
    add("Couch", [-2.7, 0, -1.7], { r: [0, PI / 2, 0], c: "#B03A2E" });
    add("Couch", [2.7, 0, -1.7], { r: [0, -PI / 2, 0], c: "#2E7D80" });
    add("Couch", [0, 0, -2.75], { c: "#D6A03A" });
    add("Platter", [-0.7, 0.87, -1.7], { o: { kind: "fruit" } });
    add("Platter", [0.35, 0.87, -1.6], { o: { kind: "mushroom" } });
    add("Platter", [1.0, 0.87, -1.85], { o: { kind: "bread" } });
    add("Goblet", [-0.1, 0.87, -1.5]); add("Goblet", [0.7, 0.87, -1.35]); add("Goblet", [-1.0, 0.87, -1.4]);
    add("Jug", [-1.1, 0.87, -1.95]); add("Scroll", [0.15, 0.87, -2.0]);
    add("Cushion", [-2.7, 0.62, -1.3], { c: "#E7B833" }); add("Cushion", [2.7, 0.62, -2.0], { c: "#B03A2E" }); add("Cushion", [-0.6, 0.62, -2.7], { c: "#2E7D80" }); add("Cushion", [0.7, 0.62, -2.7], { c: "#2E7D80" });
    for (const x of [-4.3, 4.3]) add("Brazier", [x, 0, -2.4]);
    for (const x of [-4.8, 4.8]) add("Bust", [x, 0, -3.0]);
    for (const [x, z, s] of [[-6.4, -2.4, 1], [-6.6, -1.6, 0.8], [6.4, -2.2, 1.1], [6.6, -1.4, 0.8], [-3.6, 1.8, 1.25], [3.5, 1.9, 1.15]] as [number, number, number][]) add("Amphora", [x, 0, z], { s, c: ["#C8643B", "#8F9B52", "#D8A04A"][Math.abs(Math.round(x * 3)) % 3] });
    for (const [x, z] of [[-4.2, -3.0], [4.2, -3.0], [-5.1, 1.4], [5.2, 1.2]] as [number, number][]) add("Plant", [x, 0, z], { s: 1.1 });
    add("Chandelier", [-2.4, 4.0, -1.2]); add("Chandelier", [2.4, 4.0, -1.2]); add("Chandelier", [0, 4.4, -2.4], { s: 1.3 });
    add("Table", [-3.5, 0, 0.5], { o: { w: 0.8, d: 0.8, h: 0.62 } }); add("Goblet", [-3.5, 0.69, 0.5]); add("OilLamp", [-3.3, 0.69, 0.65]); add("Jug", [-3.7, 0.69, 0.4]);
    add("Table", [3.6, 0, 0.7], { o: { w: 0.8, d: 0.8, h: 0.62 } }); add("Platter", [3.6, 0.69, 0.7], { s: 0.6, o: { kind: "fruit" } }); add("Bowl", [3.8, 0.69, 0.55]);
    add("Stool", [-3.0, 0, 1.0]); add("Stool", [3.0, 0, 1.2]); add("Cushion", [-2.9, 0.54, 1.0], { c: "#B03A2E" });
    add("Amphora", [-3.2, 0, -0.5], { s: 0.8 }); add("Amphora", [3.3, 0, -0.4], { s: 0.9, c: "#8F9B52" });
    add("Basket", [-3.7, 0, 1.4]); add("Basket", [3.9, 0, 1.5]); add("Sack", [-4.1, 0, 0.0]); add("Plant", [4.1, 0, -0.4], { s: 0.9 });
    add("Window", [-6.9, 3.1, -3.7]); add("Window", [6.9, 3.1, -3.7]);
    scatter(items, 21, 6, [-6.8, 6.8], [1.6, 2.8], ["Amphora", "Jug", "Basket", "Plant"], [[-3.5, 3.5, 1.2, 3]]);
    return { items, wall: "fresco", floor: "mosaic", backZ: -4, halfW: 9, floorD: 18, floorZ: -1, wallH: 7, night: false, torchLights: [[-6.6, 2.6, -3.0], [6.6, 2.6, -3.0]], sky: "#FFE7B8" };
  }

  if (setId === "palace_corridor_day") {
    const zs = [-10.5, -7.5, -4.5, -1.5, 1.5, 4.5];
    zs.forEach((z, i) => {
      add("Column", [-3.0, 0, z], { o: { band: i % 2 ? "#2E7D80" : "#B5452F" } });
      add("Column", [3.0, 0, z], { o: { band: i % 2 ? "#2E7D80" : "#B5452F" } });
      add("Banner", [-3.35, 4.9, z + 1.5], { r: [0, PI / 2, 0], c: i % 2 ? "#B03A2E" : "#2E7D80" });
      add("Banner", [3.35, 4.9, z + 1.5], { r: [0, -PI / 2, 0], c: i % 2 ? "#2E7D80" : "#B03A2E" });
      add("Bust", [i % 2 ? -3.0 : 3.0, 0, z + 1.5], { r: [0, i % 2 ? PI / 2 : -PI / 2, 0], s: 0.95 });
      add("Torch", [i % 2 ? 3.35 : -3.35, 2.4, z + 0.2], { r: [0, i % 2 ? -PI / 2 : PI / 2, 0] });
      add("Amphora", [i % 2 ? -2.85 : 2.85, 0, z + 0.9], { s: 1 + (i % 3) * 0.12, c: ["#C8643B", "#8F9B52", "#D8A04A"][i % 3] });
      add("Plant", [i % 2 ? 2.8 : -2.8, 0, z + 1.2]);
    });
    add("Rug", [0, 0, -3], { c: "#B8352C", o: { w: 1.9, d: 20, border: "#2E5F73" } });
    for (const z of [-9, -4, 0.5]) { add("Window", [-3.45, 3.0, z], { r: [0, PI / 2, 0] }); add("Door", [3.4, 0, z - 2], { r: [0, -PI / 2, 0] }); }
    add("Door", [0, 0, -11.7], { s: 1.6 }); add("Arch", [0, 0, -11.85], { o: { w: 3.4, h: 3.8 } });
    for (const z of [-8.5, -3, 2.5]) add("HangingLamp", [0, 4.4, z], { o: { drop: 1.4 } });
    for (const z of [-6, -1, 3.5]) add("Stool", [z % 2 ? -2.3 : 2.3, 0, z]);
    for (const z of [-6.5, 0.2]) add("Table", [2.3, 0, z], { o: { w: 0.8, d: 0.6, h: 0.65 } });
    add("Goblet", [2.3, 0.72, -6.5]); add("Jug", [2.3, 0.72, 0.2]);
    return { items, wall: "fresco", floor: "slabs", backZ: -12, halfW: 3.45, floorD: 24, floorZ: -4, wallH: 7, night: false, torchLights: [[-3.2, 2.6, -1.3], [3.2, 2.6, -4.3]], sky: "#FFE7B8" };
  }

  if (setId === "palace_quarters_day") {
    add("Window", [-2.4, 2.6, -3.1]); add("Window", [3.2, 2.7, -3.1], { s: 0.9 });
    add("Door", [4.2, 0, -3.1], { s: 0.95 });
    add("Shelf", [-3.6, 1.6, -3.0]); add("Shelf", [-3.6, 2.5, -3.0], { s: 0.9 }); add("Shelf", [0.6, 2.1, -3.0]);
    add("Bed", [-4.2, 0, -1.8], { r: [0, PI / 2, 0] }); add("Bed", [-4.2, 0, -0.5], { r: [0, PI / 2, 0], c: "#C9A455" });
    add("Bed", [4.3, 0, -1.4], { r: [0, -PI / 2, 0], c: "#C9A455" });
    for (const [x, z] of [[-1.6, -2.7], [-0.9, -2.5], [2.2, -2.7], [5.0, -2.2]] as [number, number][]) add("Barrel", [x, 0, z], { s: 0.9 + (x > 0 ? 0.1 : 0) });
    for (const [x, z] of [[-2.5, -2.5], [1.4, -2.7], [3.8, -2.6], [-5.0, 0.8]] as [number, number][]) add("Sack", [x, 0, z]);
    for (const [x, z] of [[-3.3, -2.5], [3.0, -2.5], [5.2, -0.2]] as [number, number][]) add("Basket", [x, 0, z]);
    add("Crate", [0.0, 0, -2.7]); add("Crate", [0.0, 0.6, -2.7], { s: 0.75 }); add("Crate", [-5.2, 0, 1.6]);
    add("Table", [1.9, 0, -1.2], { o: { w: 1.3, d: 0.8, h: 0.75 } });
    add("Jug", [1.6, 0.82, -1.2], { c: "#3E9AA8" }); add("Jug", [1.95, 0.82, -1.0], { c: "#3E9AA8" }); add("Bowl", [2.3, 0.82, -1.3]); add("Loaf", [2.2, 0.85, -1.05]); add("OilLamp", [1.95, 0.82, -1.45]);
    add("Stool", [1.0, 0, -0.7]); add("Stool", [2.9, 0, -0.3]);
    add("Rug", [-0.2, 0, -0.4], { c: "#C9892F", o: { w: 2.6, d: 1.5, border: "#7B4527" } });
    add("Laundry", [-1.0, 3.4, -2.5]); add("Laundry", [2.0, 3.6, -2.8], { s: 0.9 });
    add("Hanging", [-2.6, 3.6, -2.7], { o: { kind: "herbs" } }); add("Hanging", [3.6, 3.6, -2.7], { o: { kind: "garlic" } }); add("Hanging", [0.6, 3.6, -2.6], { o: { kind: "pot" } }); add("Hanging", [-0.2, 3.6, -2.4], { o: { kind: "herbs" } });
    add("OilLamp", [-3.6, 1.68, -3.0]); add("OilLamp", [0.2, 2.18, -3.0]);
    for (const [x, z, s] of [[-5.3, -2.4, 1], [-5.5, -1.7, 0.8], [5.6, -1.0, 0.9], [5.4, 0.3, 1.1], [-4.8, 1.0, 1.0]] as [number, number, number][]) add("Amphora", [x, 0, z], { s });
    add("Plant", [3.8, 0, -0.8]); add("Cushion", [-4.2, 0.12, 0.7], { c: "#C95E4B" }); add("Cushion", [-3.8, 0.1, 1.1], { c: "#4E8CA3" });
    scatter(items, 5, 6, [-6, 6], [1.8, 3.0], ["Basket", "Sack", "Barrel", "Crate"], [[-3, 3, 1.2, 3.5]]);
    return { items, wall: "plaster", floor: "planks", backZ: -3.3, halfW: 6.2, floorD: 14, floorZ: 0, wallH: 7, night: false, torchLights: [], sky: "#FFE7B8" };
  }

  // palace_kitchen_day / palace_kitchen_night
  const night = setId.includes("night");
  add("Oven", [0, 0, -3.1], { s: 1.15 });
  add("Cauldron", [-3.6, 0, -2.6]); add("Cauldron", [3.7, 0, -2.5], { s: 0.9 });
  add("Table", [0, 0, -1.8], { o: { w: 4.0, d: 1.0, h: 0.85 } });
  add("Platter", [-1.3, 0.92, -1.8], { o: { kind: "fish" } }); add("Platter", [-0.4, 0.92, -1.7], { o: { kind: "fruit" } });
  add("Platter", [0.6, 0.92, -1.9], { o: { kind: "mushroom" } }); add("Platter", [1.5, 0.92, -1.75], { o: { kind: "bread" } });
  add("Bowl", [-0.9, 0.92, -2.1]); add("Bowl", [1.0, 0.92, -1.5]); add("Jug", [-1.8, 0.92, -2.0]); add("Jug", [1.9, 0.92, -2.0]); add("Goblet", [0.1, 0.92, -1.5]); add("Loaf", [-0.2, 0.92, -2.1]);
  add("Shelf", [-4.7, 1.7, -3.2]); add("Shelf", [-4.7, 2.6, -3.2], { s: 0.9 }); add("Shelf", [4.7, 1.7, -3.2]); add("Shelf", [4.7, 2.6, -3.2], { s: 0.9 });
  add("Hanging", [-2.2, 4.0, -2.3], { o: { kind: "pot" } }); add("Hanging", [-1.6, 4.0, -2.0], { o: { kind: "herbs" } }); add("Hanging", [2.0, 4.0, -2.3], { o: { kind: "pot" } }); add("Hanging", [2.7, 4.0, -2.0], { o: { kind: "garlic" } }); add("Hanging", [0.9, 4.0, -2.6], { o: { kind: "fish" } }); add("Hanging", [-0.9, 4.0, -2.6], { o: { kind: "herbs" } });
  add("Barrel", [-5.2, 0, -1.8]); add("Barrel", [-5.0, 0, -0.9], { s: 0.9 }); add("Barrel", [5.3, 0, -1.6]); add("Barrel", [5.1, 0, -0.6], { s: 0.9 });
  add("Sack", [-2.8, 0, -3.1]); add("Sack", [2.9, 0, -3.1]); add("Sack", [-5.5, 0, 0.3]); add("Sack", [5.6, 0, 0.6]);
  add("Basket", [-3.0, 0, -1.2]); add("Basket", [3.1, 0, -1.0]); add("Basket", [-5.3, 0, 1.6]); add("Basket", [5.2, 0, 1.4]);
  add("Crate", [-4.0, 0, -0.4]); add("Crate", [4.0, 0, -0.2]); add("Crate", [4.0, 0.6, -0.2], { s: 0.7 });
  for (const [x, z, s] of [[-6.0, -2.4, 1.1], [-6.1, -1.2, 0.9], [6.0, -2.3, 1.1], [6.1, -1.0, 0.9], [-4.0, 1.8, 1.2], [4.1, 1.9, 1.2]] as [number, number, number][]) add("Amphora", [x, 0, z], { s, c: ["#C8643B", "#8F9B52", "#D8A04A"][Math.abs(Math.round(x)) % 3] });
  add("Stool", [-2.6, 0, -0.6]); add("Stool", [2.7, 0, -0.4]); add("Stool", [-0.2, 0, -0.9]);
  add("Brazier", [-2.0, 0, 1.6], { s: 0.9 }); add("Brazier", [5.8, 0, 2.2], { s: 0.9 });
  add("Torch", [-3.4, 2.3, -3.6]); add("Torch", [3.4, 2.3, -3.6]); add("Torch", [-6.2, 2.3, -3.6]); add("Torch", [6.2, 2.3, -3.6]);
  add("Door", [6.6, 0, -3.5], { s: 1.1 });
  add("Window", [-6.6, 3.2, -3.6]); add("Plant", [6.2, 0, 1.1]);
  add("Rug", [0, 0, 0.8], { c: "#C9892F", o: { w: 3.8, d: 1.8, border: "#7B4527" } });
  add("OilLamp", [-0.6, 0.92, -1.5]); add("Scroll", [1.2, 0.92, -1.4]);
  scatter(items, 33, 5, [-6.6, 6.6], [1.8, 3.0], ["Basket", "Sack", "Barrel", "Crate", "Amphora"], [[-3.5, 3.5, 1.3, 3.2]]);
  return { items, wall: night ? "stone" : "brick", floor: "terracotta", backZ: -3.9, halfW: 7.2, floorD: 16, floorZ: -0.5, wallH: 7, night, torchLights: [[-3.4, 2.7, -3.0], [3.4, 2.7, -3.0]], sky: night ? "#5A78C2" : "#FFE7B8" };
}
