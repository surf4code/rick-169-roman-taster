// Density gate: counts dressed props per set (target >= 40, Rick-style rich sets). Run: node scripts/qa_density.mjs
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import path from "node:path";
const out = path.resolve("out/qa/_dressing.mjs");
await build({ entryPoints: ["src/components/sets/dressing.ts"], bundle: true, format: "esm", outfile: out, platform: "node" });
const { buildSet } = await import(pathToFileURL(out).href + "?v=" + Date.now());
let bad = 0;
for (const id of ["palace_quarters_day", "palace_corridor_day", "banquet_hall_day", "palace_kitchen_day", "palace_kitchen_night"]) {
  const s = buildSet(id); const kinds = new Set(s.items.map((i) => i.t));
  const ok = s.items.length >= 40;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${id.padEnd(22)} ${String(s.items.length).padStart(3)} props, ${kinds.size} prop types`);
}
process.exit(bad ? 1 : 0);
