#!/usr/bin/env python3
"""Compare rendered frames vs Ricks Clips reference frames (luminance, saturation, side-by-side sheet)."""
import argparse, glob, os
import cv2
import numpy as np

def sample_stats(video_path, n=6):
    cap = cv2.VideoCapture(video_path)
    total = max(1, int(cap.get(cv2.CAP_PROP_FRAME_COUNT)))
    frames, lums, sats = [], [], []
    for idx in np.linspace(int(total * 0.08), int(total * 0.90), n, dtype=int):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ok, bgr = cap.read()
        if not ok:
            continue
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
        cmax, cmin = rgb.max(axis=-1), rgb.min(axis=-1)
        sat = np.where(cmax > 1e-5, (cmax - cmin) / np.maximum(cmax, 1e-5), 0.0)
        lums.append(float(lum.mean()))
        sats.append(float(sat.mean()))
        frames.append(bgr)
    cap.release()
    return frames, float(np.mean(lums)), float(np.mean(sats))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--render", required=True)
    ap.add_argument("--ref", required=True, help="Path to a Ricks Clips reference MP4")
    ap.add_argument("--out", default="out/qa/grade_compare.jpg")
    args = ap.parse_args()

    r_frames, r_lum, r_sat = sample_stats(args.render, 4)
    ref_frames, ref_lum, ref_sat = sample_stats(args.ref, 4)
    print(f"RENDER | lum={r_lum:.3f} (target 0.45-0.55) | sat={r_sat:.3f} (target 0.40-0.65)")
    print(f"REF    | lum={ref_lum:.3f} | sat={ref_sat:.3f}")

    tw, th = 480, 270
    row1 = np.hstack([cv2.resize(f, (tw, th)) for f in r_frames[:4]])
    row2 = np.hstack([cv2.resize(f, (tw, th)) for f in ref_frames[:4]])
    sheet = np.vstack([row1, row2])
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    cv2.imwrite(args.out, sheet, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    print(f"[compare_ricks_grade] Saved side-by-side -> {args.out}")

if __name__ == "__main__":
    main()
