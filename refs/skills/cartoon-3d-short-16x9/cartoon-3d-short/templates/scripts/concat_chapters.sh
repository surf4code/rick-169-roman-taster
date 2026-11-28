#!/usr/bin/env bash
# Join rendered chapters (same codec/size/fps) into one picture track, then mux the final mix.
# usage: bash scripts/concat_chapters.sh out/final mix.wav out/ch01/video.mp4 out/ch02/video.mp4 ...
set -e
OUT="${1:?out base, e.g. out/final}"; MIX="${2:?mix.wav}"; shift 2
mkdir -p "$(dirname "$OUT")"; : > "$OUT.list.txt"
for f in "$@"; do echo "file '$(realpath "$f")'" >> "$OUT.list.txt"; done
ffmpeg -y -f concat -safe 0 -i "$OUT.list.txt" -c copy "$OUT.picture.mp4"
ffmpeg -y -i "$OUT.picture.mp4" -i "$MIX" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -shortest "$OUT.mp4"
echo "final: $OUT.mp4"
