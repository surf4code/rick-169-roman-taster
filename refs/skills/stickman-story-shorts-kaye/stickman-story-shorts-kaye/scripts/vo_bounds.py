"""Print speech start/end/length for voice-over files.

usage: python vo_bounds.py vo_01.wav vo_02.wav ...
Prints one JSON line per file: {"file", "start", "end", "speech", "total"}.
Use "speech" to set each shot's generation length: max(3, ceil(speech + 1)).
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fftools import speech_bounds  # noqa: E402

for f in sys.argv[1:]:
    s, e, t = speech_bounds(f)
    print(json.dumps({"file": f, "start": s, "end": e, "speech": round(e - s, 3), "total": t}))
