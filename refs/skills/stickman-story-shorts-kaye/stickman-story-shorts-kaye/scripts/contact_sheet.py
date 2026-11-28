"""Make a contact sheet (frame grid with timestamps) for slop review.

usage: python contact_sheet.py video.mp4 out.jpg [frames=18] [start=0] [end=duration]
Use 18 frames per generated shot; for the final edit, run it on 6-second windows
with 27 frames each (about one frame every 0.22 s).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fftools import probe, run  # noqa: E402

video, out = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 18
dur, _ = probe(video)
t0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
t1 = float(sys.argv[5]) if len(sys.argv) > 5 else dur - 0.05
cols = 9
rows = (n + cols - 1) // cols
span = max(0.1, t1 - t0)
run([
    "-ss", f"{t0:.3f}", "-t", f"{span:.3f}", "-i", video,
    "-vf",
    f"fps={n}/{span:.3f},scale=200:-2,"
    "drawtext=text='%{pts\\:hms\\:" + f"{t0:.3f}" + "}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.5,"
    f"tile={cols}x{rows}",
    "-frames:v", "1", "-q:v", "3", out,
])
print(out)
