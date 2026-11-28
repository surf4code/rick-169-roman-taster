#!/usr/bin/env bash
# B0 QA. Every image written here is a REAL Remotion render (no Pillow/mock-ups).
# Run from studio/:  npm run qa:b0
set -euo pipefail
OUT=out/qa/b0
mkdir -p "$OUT"
node --no-warnings scripts/test_projection.mjs
# 60 = S01 wide (+ front-layer amphora), 525 = S06 fly-through (+ tag),
# 740 = S08 top-down, 830 = S09 low angle (+ tag), 1530 = S16 night.
for f in 60 525 740 830 1530; do
  npx remotion still src/index.ts StyleTestOpening      "$OUT/st_${f}.png"       --frame=$f --gl=swangle
  npx remotion still src/index.ts StyleTestOpeningDebug "$OUT/st_${f}_debug.png" --frame=$f --gl=swangle
done
npx remotion still src/index.ts CharacterConsistencySheet out/qa/character_consistency_sheet.png --frame=0 --gl=swangle
echo "B0 QA stills (real Remotion renders) in $OUT"
