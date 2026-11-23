#!/usr/bin/env python3
"""Render Shot 1 (90 frames = 3s @30fps) and report exact seconds/frame + 21-min projection."""
import subprocess, time, os

os.makedirs("out/qa", exist_ok=True)
t0 = time.perf_counter()
subprocess.run([
    "npx", "remotion", "render", "src/index.ts", "StyleTestOpening", "out/qa/shot1_bench.mp4",
    "--frames=0-89", "--codec=h264", "--crf=18", "--pixel-format=yuv420p", "--gl=swangle", "--concurrency=2"
], check=True)
elapsed = time.perf_counter() - t0
spf = elapsed / 90.0
proj_single_min = (37800 * spf) / 60.0
proj_40_min = proj_single_min / 40.0
print(f"BENCHMARK | 90 frames in {elapsed:.2f}s -> {spf:.3f} seconds/frame")
print(f"PROJECTION (21m / 37,800 frames) | 1 machine: {proj_single_min:.1f} min | 40 CI jobs: {proj_40_min:.1f} min")
