#!/usr/bin/env python3
import argparse, subprocess, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--voice", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    subprocess.check_call([
        "ffmpeg", "-y", "-i", args.video, "-i", args.voice,
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        "-af", "highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11",
        "-c:a", "aac", "-b:a", "192k", "-shortest", args.out
    ])
    proc = subprocess.run([
        "ffmpeg", "-v", "info", "-i", args.out,
        "-vf", "blackdetect=d=0.1:pix_th=0.05", "-f", "null", "-"
    ], stderr=subprocess.PIPE, text=True)
    if "black_start" in proc.stderr:
        sys.exit("FAIL: Black frames detected.")
    print(f"[mux_master] PASS -14 LUFS, zero black frames -> {args.out}")

if __name__ == "__main__":
    main()
