#!/usr/bin/env python3
"""QA step: compare a render with a Rick reference clip. Usage: compare_to_rick.py mine.mp4 rick.mp4
Reports (1) temporal smoothness: share of frame-to-frame jumps that are outliers (flicker / pops),
(2) edge profile: mean gradient of the strongest edges (low = soft/blurry, very high with many stair-steps = aliased),
(3) stair-step score: fraction of edge pixels whose neighbours form hard 1px steps (aliasing)."""
import subprocess, sys, numpy as np

def frames(path, w=640, h=360, n=240):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-frames:v", str(n), "-vf", f"scale={w}:{h}:flags=area,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(float)

def report(name, a):
    d = np.abs(np.diff(a, axis=0)).mean((1, 2)); med = np.median(d) + 1e-6
    out = (d > 4 * med + 1.0).mean()
    gx = np.abs(np.diff(a, axis=2))[:, :-1, :]; gy = np.abs(np.diff(a, axis=1))[:, :, :-1]
    g = np.hypot(gx, gy); thr = np.percentile(g, 97)
    edge = g[g > thr].mean()
    steps = ((g > thr) & (np.abs(gx - gy) > 0.8 * g)).mean() / max((g > thr).mean(), 1e-6)
    print(f"{name:6s} frames={len(a)} pop-outlier-share={out:.3f} edge-strength={edge:.1f} stair-step={steps:.3f}")

if __name__ == "__main__":
    report("mine", frames(sys.argv[1])); report("rick", frames(sys.argv[2], 360, 640))
