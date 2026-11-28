"""Shared helpers: locate ffmpeg, probe durations, detect speech bounds."""
import os
import re
import shutil
import subprocess
import sys


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg  # pip install imageio-ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg not found. Install it, or run: pip install imageio-ffmpeg")


FF = ffmpeg_exe()


def run(args, quiet=True):
    p = subprocess.run([FF, "-hide_banner", "-y"] + args, capture_output=True, text=True)
    if p.returncode != 0:
        sys.stderr.write(p.stderr[-3000:])
        raise SystemExit(f"ffmpeg failed: {' '.join(args[:6])} ...")
    return p.stderr


def probe(path):
    """Return (duration_seconds, has_audio)."""
    p = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", p.stderr)
    if not m:
        raise SystemExit(f"cannot read duration of {path}")
    h, mi, s = m.groups()
    dur = int(h) * 3600 + int(mi) * 60 + float(s)
    return dur, ("Audio:" in p.stderr)


def speech_bounds(path, threshold_db=-40, min_silence=0.05):
    """Return (start, end, total) of speech in an audio/video file using silencedetect."""
    total, _ = probe(path)
    err = subprocess.run(
        [FF, "-hide_banner", "-i", path, "-af",
         f"silencedetect=noise={threshold_db}dB:d={min_silence}", "-f", "null", os.devnull],
        capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    speech_start = 0.0
    speech_end = total
    if starts and starts[0] < 0.02 and ends:
        speech_start = ends[0]
    if starts and (not ends or starts[-1] > ends[-1]):
        speech_end = starts[-1]  # trailing silence runs to EOF without an end mark
    elif starts and ends and len(starts) > 1 and ends[-1] >= total - 0.03:
        speech_end = starts[-1]  # trailing silence closed at EOF
    return round(speech_start, 3), round(speech_end, 3), round(total, 3)
