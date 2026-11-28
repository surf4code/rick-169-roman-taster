#!/usr/bin/env bash
# Render ONE chapter (run this on each machine, one chapter per machine, or loop locally).
# usage: bash scripts/render_chapters.sh Ch03 [scale=1.3333] [gl=swangle|angle]
#   -> out/ch03/video.mp4 (silent audio track; mux the mix later with -map 0:v:0 -map 1:a:0)
# Needs: REMOTION_TMP on a big disk, chromium/chrome (CHROME_PATH to override).
set -e
COMP="${1:?composition id, e.g. Ch03}"; SCALE="${2:-1.3333}"; GL="${3:-${REMOTION_GL:-swangle}}"
N=$(echo "$COMP" | tr 'A-Z' 'a-z')
BROWSER="${CHROME_PATH:-$(command -v chromium-browser || command -v chromium || command -v google-chrome || true)}"
mkdir -p "out/$N"
export TEMP="${REMOTION_TMP:-$HOME/remotion-tmp}" TMP="${REMOTION_TMP:-$HOME/remotion-tmp}"; mkdir -p "$TEMP"
npx remotion render src/index.ts "$COMP" "out/$N/video.mp4" --codec h264 --crf 16 --scale "$SCALE" --gl="$GL" \
  ${BROWSER:+--browser-executable="$BROWSER"}
echo "rendered out/$N/video.mp4"
