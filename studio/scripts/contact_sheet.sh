#!/usr/bin/env bash
# Renders one real still per shot (mid-shot frame) and tiles them into out/qa/contact_sheet.png (needs ImageMagick or Pillow).
set -e
cd "$(dirname "$0")/.."
CH="${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}"
mkdir -p out/qa/shots
python3 - <<'PY' > out/qa/frames.txt
import json
for s in json.load(open("src/data/styleTestShots.json"))["shots"]:
    print(s["id"], round((s["start"]*0.4+s["end"]*0.6)*30))
PY
render_one() { id=$1; fr=$2; npx remotion still src/index.ts StyleTestOpening out/qa/shots/$id.png --frame=$fr --gl=swangle ${CH:+--browser-executable="$CH"} --timeout=120000 >/dev/null 2>&1 && echo "ok $id" || echo "FAIL $id"; }
export -f render_one; export CH
cat out/qa/frames.txt | xargs -P ${PAR:-2} -L1 bash -c 'render_one $0 $1'
