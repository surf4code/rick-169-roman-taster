#!/usr/bin/env python3
import argparse, json, math, os, subprocess
import numpy as np

def get_duration_ffprobe(audio_path: str) -> float:
    return float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ], text=True).strip())

def extract_speech_features(audio_path: str, fps: int = 30):
    try:
        import librosa
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        duration = float(len(y) / sr)
        hop = max(1, int(sr / fps))
        rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
        p95 = float(np.percentile(rms, 95)) if len(rms) > 0 else 1.0
        norm_rms = np.clip(rms / max(p95, 1e-6), 0.0, 1.0).tolist()
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
        c_max = float(np.percentile(centroid, 95)) if len(centroid) > 0 else 3000.0
        norm_cent = np.clip(centroid / max(c_max, 1.0), 0.0, 1.0).tolist()
        return duration, [round(v, 3) for v in norm_rms], [round(c, 3) for c in norm_cent]
    except ImportError:
        duration = get_duration_ffprobe(audio_path)
        n = int(math.ceil(duration * fps))
        return duration, [round(abs(math.sin(i * 0.42)) * 0.78, 3) for i in range(n)], [0.5] * n

def transcribe_whisper(audio_path: str):
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segs, _ = model.transcribe(audio_path, word_timestamps=True)
        phrases, words = [], []
        for s in segs:
            phrases.append({"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip()})
            for w in (s.words or []):
                words.append({"start": round(w.start, 3), "end": round(w.end, 3), "word": w.word.strip()})
        return phrases, words
    except Exception:
        return [], []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out", default="src/timeline.json")
    args = ap.parse_args()
    dur, rms, cent = extract_speech_features(args.voice, args.fps)
    phrases, words = transcribe_whisper(args.voice)
    out = {
        "fps": args.fps, "duration_sec": round(dur, 3), "total_frames": int(math.ceil(dur * args.fps)),
        "speech_envelope": rms, "speech_centroid": cent, "phrases": phrases, "words": words
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    json.dump(out, open(args.out, "w", encoding="utf-8"), indent=2)
    print(f"[analyze_audio] {dur:.2f}s | {len(words)} words -> {args.out}")

if __name__ == "__main__":
    main()
