"""Assemble the final vertical short from per-shot clips + per-line voice-over.

usage: python assemble.py plan.json

plan.json:
{
  "out": "final.mp4",
  "music": "music.mp3",          # optional instrumental bed (looped/trimmed)
  "music_gain": 0.13,             # 0.10-0.16 keeps the voice on top
  "sfx_gain": 0.5,                # level of each clip's own sound effects
  "caption_y": 0.66,              # caption centre as a fraction of height (0 = top)
  "font": "Arial", "font_size": 128,
  "shots": [
    {"video": "shots/s01.mp4", "vo": "vo/vo_01.wav",
     "caption": "When Leonardo da Vinci applied ...",   # what to show (digits allowed: "0.4")
     "src_in": 0.3,               # optional: where the usable part of the clip starts
     "src_out": 3.9,              # optional: where it ends (cut slop away with these two)
     "tail": 0.0}                 # optional extra hold after the line (use ~0.6 on the last shot)
  ]
}

Each shot lasts exactly as long as its spoken line (+0.1 s). The chosen clip range is
time-fitted to that length. Captions are 1-2 words at a time, bold white with a black outline.
"""
import json
import math
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fftools import probe, run, speech_bounds  # noqa: E402

W, H, FPS = 1080, 1920, 30

plan_path = sys.argv[1]
base = os.path.dirname(os.path.abspath(plan_path))
plan = json.load(open(plan_path))


def P(p):
    return p if os.path.isabs(p) else os.path.join(base, p)


tmp = tempfile.mkdtemp(prefix="assemble_")
segs, vos, sfxs, cues = [], [], [], []
t = 0.0
shots = plan["shots"]
for i, s in enumerate(shots):
    vs, ve, _ = speech_bounds(P(s["vo"]))
    speech = max(0.4, ve - vs)
    dur = round(speech + 0.1 + float(s.get("tail", 0.0)), 3)
    clip_dur, clip_has_audio = probe(P(s["video"]))
    a = float(s.get("src_in", 0.3))
    a = min(a, max(0.0, clip_dur - 0.5))
    b = float(s.get("src_out", min(clip_dur - 0.05, a + dur)))
    b = max(a + 0.3, min(b, clip_dur - 0.02))
    factor = dur / (b - a)

    seg = os.path.join(tmp, f"v{i:03d}.mp4")
    run(["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", P(s["video"]),
         "-vf", f"setpts={factor:.5f}*(PTS-STARTPTS),scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H},fps={FPS},format=yuv420p",
         "-an", "-t", f"{dur:.3f}", "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", seg])
    segs.append(seg)

    sfx = os.path.join(tmp, f"s{i:03d}.wav")
    if clip_has_audio:
        run(["-ss", f"{a:.3f}", "-i", P(s["video"]), "-vn",
             "-af", f"apad,atrim=0:{dur:.3f},afade=t=in:d=0.04,afade=t=out:st={max(0, dur - 0.06):.3f}:d=0.06",
             "-ar", "48000", "-ac", "2", sfx])
    else:
        run(["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{dur:.3f}", sfx])
    sfxs.append(sfx)

    vo = os.path.join(tmp, f"o{i:03d}.wav")
    run(["-ss", f"{max(0, vs - 0.03):.3f}", "-i", P(s["vo"]), "-vn",
         "-af", f"apad,atrim=0:{dur:.3f}", "-ar", "48000", "-ac", "2", vo])
    vos.append(vo)

    # caption chunks: 1-2 words, timed by letter count across the spoken part
    words = (s.get("caption") or "").split()
    if words:
        weights = [max(2, len(re.sub(r"[^\w]", "", w))) + 1 for w in words]
        tot = sum(weights)
        tt, timed = 0.03, []
        for w, wt in zip(words, weights):
            d = speech * wt / tot
            timed.append([w, tt, tt + d])
            tt += d
        chunks, k = [], 0
        while k < len(timed):
            w, st, en = timed[k]
            core = re.sub(r"[^\w]", "", w)
            if (k + 1 < len(timed) and len(core) <= 3 and not w.endswith((",", ".", "!", "?", ":"))
                    and len(w) + 1 + len(timed[k + 1][0]) <= 13):
                chunks.append([w + " " + timed[k + 1][0], st, timed[k + 1][2]])
                k += 2
            else:
                chunks.append([w, st, en])
                k += 1
        for j in range(len(chunks) - 1):
            chunks[j][2] = chunks[j + 1][1]
        chunks[-1][2] = min(dur, speech + 0.08)
        for w, st, en in chunks:
            cues.append((w, t + st, t + en))
    t += dur
total = t


def concat_list(files, name):
    lst = os.path.join(tmp, name)
    with open(lst, "w") as f:
        for p in files:
            f.write(f"file '{p}'\n")
    return lst


video_cat = os.path.join(tmp, "video.mp4")
run(["-f", "concat", "-safe", "0", "-i", concat_list(segs, "v.txt"), "-c", "copy", video_cat])
vo_cat = os.path.join(tmp, "vo.wav")
run(["-f", "concat", "-safe", "0", "-i", concat_list(vos, "o.txt"), "-c", "copy", vo_cat])
sfx_cat = os.path.join(tmp, "sfx.wav")
run(["-f", "concat", "-safe", "0", "-i", concat_list(sfxs, "s.txt"), "-c", "copy", sfx_cat])


def ass_time(x):
    cs = int(round(x * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


fs = int(plan.get("font_size", 128))
margin_v = int(H * (1 - float(plan.get("caption_y", 0.66))) - fs / 2)
ass = os.path.join(tmp, "captions.ass")
with open(ass, "w", encoding="utf-8") as f:
    f.write("[Script Info]\nScriptType: v4.00+\nPlayResX: %d\nPlayResY: %d\nWrapStyle: 2\n\n" % (W, H))
    f.write("[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
            "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, "
            "Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n")
    f.write(f"Style: Cap,{plan.get('font', 'Arial')},{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,"
            f"-1,0,0,0,100,100,0,0,1,9,4,2,40,40,{margin_v},1\n\n")
    f.write("[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    for w, st, en in cues:
        txt = w.replace("{", "(").replace("}", ")")
        f.write(f"Dialogue: 0,{ass_time(st)},{ass_time(en)},Cap,,0,0,0,,"
                f"{{\\fscx85\\fscy85\\t(0,90,\\fscx100\\fscy100)}}{txt}\n")

out = P(plan.get("out", "final.mp4"))
inputs = ["-i", video_cat, "-i", vo_cat, "-i", sfx_cat]
mix = f"[1:a]volume=1.0[a1];[2:a]volume={float(plan.get('sfx_gain', 0.5))}[a2];"
n_in = 2
if plan.get("music"):
    inputs += ["-stream_loop", "-1", "-i", P(plan["music"])]
    mg = float(plan.get("music_gain", 0.13))
    mix += (f"[3:a]atrim=0:{total:.3f},volume={mg},afade=t=in:d=0.3,"
            f"afade=t=out:st={max(0, total - 1.5):.3f}:d=1.5[a3];")
    n_in = 3
mix += "".join(f"[a{k}]" for k in range(1, n_in + 1))
mix += f"amix=inputs={n_in}:normalize=0:duration=first,alimiter=limit=0.95[aout]"
ass_arg = ass.replace("\\", "/").replace(":", "\\:")
run(inputs + ["-filter_complex", f"[0:v]ass='{ass_arg}'[vout];{mix}",
              "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}",
              "-movflags", "+faststart", out])
print(json.dumps({"out": out, "duration": round(total, 2), "shots": len(shots), "captions": len(cues)}))
