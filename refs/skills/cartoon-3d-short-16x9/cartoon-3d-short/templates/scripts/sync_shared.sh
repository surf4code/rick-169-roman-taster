#!/usr/bin/env bash
# Keep the cast/look identical in every chapter: copy the "look + characters" files from the master chapter
# (default ch01) into the other chapter folders. Story/camera/world layout files (story.ts, build.ts, Bridge.tsx) stay per chapter.
# usage: bash scripts/sync_shared.sh <videoName> [master=ch01]   e.g.  bash scripts/sync_shared.sh space ch01
set -e
NAME="${1:?video name (folder prefix in src/videos)}"; MASTER="${2:-ch01}"
SHARED="toon.ts cast.ts cardshade.ts shade.ts lights.ts grade.ts ink.ts lensblur.ts paint.ts world.ts"
for d in src/videos/${NAME}_ch*; do
  [ "$d" = "src/videos/${NAME}_${MASTER}" ] && continue
  for f in $SHARED; do cp -f "src/videos/${NAME}_${MASTER}/$f" "$d/$f"; done
  echo "synced $d"
done
