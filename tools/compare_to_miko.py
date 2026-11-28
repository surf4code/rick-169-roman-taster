#!/usr/bin/env python3
"""QA comparer: measure a video against the Miko targets and write a PASS/WARN/FAIL report.
usage: python3 tools/compare_to_miko.py --video final.mp4 [--miko miko.mp4] [--out qa_out]
Needs ffmpeg + numpy + pillow. Exit code 1 if any FAIL."""
import argparse, json, os, subprocess, sys
import numpy as np
from PIL import Image

W, H = 320, 180
T = json.load(open(os.path.join(os.path.dirname(__file__), "miko_targets.json")))

def probe(path):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", path], capture_output=True, text=True).stdout
    j = json.loads(o); s = j["streams"][0]; n, d = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(n) / float(d), float(j["format"]["duration"])

def frames(path, ss=0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(dur)] if dur else []) + ["-i", path, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    return np.frombuffer(raw[: len(raw) // (W * H) * W * H], np.uint8).reshape(-1, H, W).astype(np.float32)

def judge(v, lo=None, hi=None, warn_hi=None):
    if lo is not None and v < lo: return "FAIL"
    if hi is not None and v > hi: return "WARN" if (warn_hi is not None and v <= warn_hi) else "FAIL"
    return "PASS"

def measure(video):
    w, h, fps, dur = probe(video)
    a = frames(video)
    d = np.abs(np.diff(a, axis=0)); cut = d.mean(axis=(1, 2)) > 10        # hard cut / fade frames excluded from motion
    dd = d[~cut]
    bar = lambda rows: float((rows.mean(axis=(0, 2)) < 6).mean())           # fraction of rows that are black
    top = a[:, : int(H * 0.2)]; bot = a[:, int(H * 0.8):]
    lb_top = float((top.mean(axis=(0, 2)) < 6)[: int(H * 0.2)].sum() / H); lb_bot = float((bot.mean(axis=(0, 2)) < 6).sum() / H)
    dark = a.mean(axis=(1, 2)) < 8; dip = np.where(dark[1:] & ~dark[:-1])[0]                   # fade-to-black = a cut too
    cuts = np.unique(np.concatenate([np.where(cut)[0], dip])); edges = np.concatenate([[0], cuts, [len(a)]]); lens = np.diff(edges) / fps; lens = lens[lens > 0.3]
    return {
        "resolution": f"{w}x{h}", "fps": round(fps, 2), "duration_s": round(dur, 2),
        "mean_luminance": round(float(a.mean()), 1), "p2_luminance": round(float(np.percentile(a, 2)), 1),
        "letterbox_top": round(lb_top, 3), "letterbox_bottom": round(lb_bot, 3),
        "bg_frame_diff": round(float((dd[:, : H // 3, : W // 3].mean() + dd[:, : H // 3, 2 * W // 3:].mean()) / 2), 2),
        "floor_frame_diff": round(float(dd[:, 2 * H // 3:].mean()), 2),
        "character_area_frame_diff": round(float(dd[:, H // 4: 3 * H // 4, W // 3: 2 * W // 3].mean()), 2),
        "frozen_frames_pct": round(float((d.mean(axis=(1, 2)) < 0.05).mean() * 100), 1),
        "shots": int(len(lens)), "median_shot_s": round(float(np.median(lens)), 2) if len(lens) else None,
    }

def sheet(video, out, n=20, cols=5):
    tmp = out + "_t"; os.makedirs(tmp, exist_ok=True)
    _, _, _, dur = probe(video); step = max(dur / n, 0.1)
    ims = []
    for i in range(n):
        p = f"{tmp}/{i:02d}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-ss", str(min(dur - 0.1, i * step + step / 2)), "-i", video, "-frames:v", "1", "-vf", "scale=480:-1", p, "-y"])
        if os.path.exists(p): ims.append(Image.open(p).convert("RGB"))
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    m = Image.new("RGB", (w * cols, h * rows))
    for i, im in enumerate(ims): m.paste(im, ((i % cols) * w, (i // cols) * h))
    m.save(out, quality=88); return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--video", required=True); ap.add_argument("--miko"); ap.add_argument("--out", default="qa_out")
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    m = measure(a.video); rows = []
    L = T["mean_luminance"]; rows.append(("Mean luminance", m["mean_luminance"], f"{L['min']}-{L['max']} (Miko ~{L['target']})", judge(m["mean_luminance"], L["min"], L["max"])))
    lb = min(m["letterbox_top"], m["letterbox_bottom"]); rows.append(("Letterbox bars (each)", lb, f">= {T['letterbox_fraction_each_bar']['min']}", judge(lb, T["letterbox_fraction_each_bar"]["min"])))
    B = T["bg_frame_diff"]; rows.append(("Background change/frame", m["bg_frame_diff"], f"<= {B['max_pass']} (Miko ~{B['target']})", judge(m["bg_frame_diff"], None, B["max_pass"], B["max_warn"])))
    F = T["floor_frame_diff"]; rows.append(("Floor change/frame", m["floor_frame_diff"], f"<= {F['max_pass']}", judge(m["floor_frame_diff"], None, F["max_pass"], F["max_warn"])))
    C = T["character_area_frame_diff"]; rows.append(("Character-area change/frame", m["character_area_frame_diff"], f"{C['min']}-{C['max']} (Miko ~{C['target']})", judge(m["character_area_frame_diff"], C["min"], C["max"])))
    rows.append(("Frame rate", m["fps"], f">= {T['min_fps']}", judge(m["fps"], T["min_fps"])))
    sheet(a.video, f"{a.out}/yours.jpg")
    if a.miko:
        n = 20; _, _, _, md = probe(a.miko)
        tmp = f"{a.out}/miko_t"; os.makedirs(tmp, exist_ok=True); ims = []
        for i in range(n):
            p = f"{tmp}/{i:02d}.png"; subprocess.run(["ffmpeg", "-v", "error", "-ss", str(30 + i * (md - 60) / n), "-i", a.miko, "-frames:v", "1", "-vf", "scale=480:-1", p, "-y"])
            ims.append(Image.open(p).convert("RGB"))
        w, h = ims[0].size; mm = Image.new("RGB", (w * 5, h * 4))
        for i, im in enumerate(ims): mm.paste(im, ((i % 5) * w, (i // 5) * h))
        mm.save(f"{a.out}/miko_reference.jpg", quality=88)
    fails = [r for r in rows if r[3] == "FAIL"]
    md_ = ["# QA vs Miko targets", f"Video: `{a.video}`  ({m['resolution']}, {m['fps']} fps, {m['duration_s']} s, {m['shots']} shots, median shot {m['median_shot_s']} s)", "", "| Check | Yours | Target | Result |", "|---|---|---|---|"]
    md_ += [f"| {r[0]} | {r[1]} | {r[2]} | **{r[3]}** |" for r in rows]
    md_ += ["", f"Overall: **{'FAIL' if fails else 'PASS'}** ({len(fails)} fail).", "", "Visual review still needed (an agent must LOOK at `yours.jpg` vs `miko_reference.jpg` and tick docs/MIKO_BIBLE.md section 5)."]
    open(f"{a.out}/report.md", "w").write("\n".join(md_)); json.dump({"metrics": m, "checks": rows}, open(f"{a.out}/report.json", "w"), indent=1)
    print("\n".join(md_)); sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
