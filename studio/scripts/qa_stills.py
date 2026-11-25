#!/usr/bin/env python3
"""Colour-grade QA on real rendered stills: mean luminance + saturation vs the warm-bright targets (rules in SKILL.md #6)."""
import sys, glob, os
import numpy as np
from PIL import Image
files = sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1 else "out/qa/shots/*.png"))
print(f"{'shot':8} {'lum':>6} {'sat':>6}  verdict")
bad = 0
for f in files:
    im = np.asarray(Image.open(f).convert("RGB").resize((480, 270)), dtype=np.float32) / 255
    mx, mn = im.max(2), im.min(2)
    lum = (0.2126 * im[..., 0] + 0.7152 * im[..., 1] + 0.0722 * im[..., 2]).mean()
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).mean()
    night = "S16" in f
    lo, hi = (0.36, 0.48) if night else (0.45, 0.55)
    ok_l = lo - 0.06 <= lum <= hi + 0.12     # tolerance: infographic/akira cards are legitimately lighter
    ok_s = 0.30 <= sat <= 0.70
    v = "ok" if ok_l and ok_s else ("DARK" if lum < lo - 0.06 else "BRIGHT" if lum > hi + 0.12 else "SAT?")
    bad += v != "ok"
    print(f"{os.path.basename(f)[:-4]:8} {lum:6.2f} {sat:6.2f}  {v}")
print(f"{len(files) - bad}/{len(files)} within tolerance")
