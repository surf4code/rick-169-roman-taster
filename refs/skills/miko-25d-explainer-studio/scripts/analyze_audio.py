#!/usr/bin/env python3
"""
Audio & Speech Timing Extractor for Miko 2.5D Explainer Studio.
Extracts duration, RMS speech envelope (for mouth lip-sync), pause/cut points,
optional Whisper word timestamps, and optional BGM beat grid into src/timeline.json.
"""

import argparse
import json
import os
import subprocess
import sys
import numpy as np


def get_duration_ffprobe(audio_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    return float(out)


def extract_speech_envelope(audio_path: str, fps: int = 30):
    """Extract per-frame RMS amplitude (0.0 to 1.0) and speech segments using librosa or ffmpeg."""
    try:
        import librosa
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        duration = float(len(y) / sr)
        hop_length = int(sr / fps)
        rms = librosa.feature.rms(y=y, frame_length=hop_length * 2, hop_length=hop_length)[0]
        p95 = float(np.percentile(rms, 95)) if len(rms) > 0 else 1.0
        norm_rms = np.clip(rms / max(p95, 1e-6), 0.0, 1.0).tolist()

        # Detect non-silent intervals for natural scene/shot cuts
        intervals = librosa.effects.split(y, top_db=32)
        segments = [
            {"start": round(float(s / sr), 3), "end": round(float(e / sr), 3)}
            for s, e in intervals if (e - s) / sr >= 0.25
        ]
        return duration, [round(v, 3) for v in norm_rms], segments
    except ImportError:
        duration = get_duration_ffprobe(audio_path)
        total_frames = int(np.ceil(duration * fps))
        # Fallback deterministic wave envelope if librosa is not installed
        env = [round(abs(np.sin(i * 0.45)) * 0.75, 3) for i in range(total_frames)]
        segments = []
        t = 0.0
        while t < duration:
            end = min(duration, t + 5.0)
            segments.append({"start": round(t, 3), "end": round(end, 3)})
            t = end
        return duration, env, segments


def extract_whisper_words(audio_path: str):
    """Optional word-level transcription via faster-whisper if installed."""
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, _ = model.transcribe(audio_path, word_timestamps=True)
        words = []
        phrases = []
        for seg in segments:
            phrases.append({
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip()
            })
            if seg.words:
                for w in seg.words:
                    words.append({
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "word": w.word.strip()
                    })
        return phrases, words
    except Exception:
        return [], []


def extract_bgm_beats(bgm_path: str):
    """Extract BPM and beat timestamps from BGM if provided."""
    if not bgm_path or not os.path.exists(bgm_path):
        return None, []
    try:
        import librosa
        y, sr = librosa.load(bgm_path, sr=22050, mono=True)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr)
        bpm = float(np.atleast_1d(tempo)[0])
        return round(bpm, 2), [round(float(t), 3) for t in beat_times]
    except Exception:
        return None, []


def build_shot_plan(duration: float, phrases: list, segments: list, fps: int = 30):
    """Generate a deterministic 2.5D camera shot list aligned to speech phrasing."""
    camera_grammars = [
        "wide_establishing_dolly",
        "medium_twoshot_orbit",
        "closeup_rack_focus",
        "ots_depth_shot",
        "isometric_data_reveal",
    ]
    anchors = phrases if phrases else segments
    if not anchors:
        anchors = [{"start": 0.0, "end": duration, "text": ""}]

    shots = []
    cur_start = 0.0
    idx = 0
    buf_text = []

    for item in anchors:
        buf_text.append(item.get("text", ""))
        span = item["end"] - cur_start
        if span >= 4.5 or item == anchors[-1]:
            end_t = duration if item == anchors[-1] else item["end"]
            shots.append({
                "shot_id": f"shot_{idx + 1:02d}",
                "start_sec": round(cur_start, 3),
                "end_sec": round(end_t, 3),
                "start_frame": int(round(cur_start * fps)),
                "end_frame": int(round(end_t * fps)),
                "camera_move": camera_grammars[idx % len(camera_grammars)],
                "narration": " ".join(t for t in buf_text if t).strip(),
                "sfx_cue": "pop_badge" if (idx % 5 == 4) else "whoosh_soft"
            })
            cur_start = end_t
            buf_text = []
            idx += 1

    return shots


def main():
    parser = argparse.ArgumentParser(description="Extract audio timeline for 2.5D video.")
    parser.add_argument("--voice", required=True, help="Path to voiceover audio (mp3/wav)")
    parser.add_argument("--bgm", default="", help="Optional path to background music")
    parser.add_argument("--fps", type=int, default=30, help="Target video FPS")
    parser.add_argument("--out", default="src/timeline.json", help="Output JSON path")
    args = parser.parse_args()

    if not os.path.exists(args.voice):
        print(f"Error: Voice file not found: {args.voice}", file=sys.stderr)
        sys.exit(1)

    duration, envelope, segments = extract_speech_envelope(args.voice, args.fps)
    phrases, words = extract_whisper_words(args.voice)
    bpm, beats = extract_bgm_beats(args.bgm)
    shots = build_shot_plan(duration, phrases, segments, args.fps)

    timeline = {
        "fps": args.fps,
        "duration_sec": round(duration, 3),
        "total_frames": int(np.ceil(duration * args.fps)),
        "bgm_bpm": bpm,
        "bgm_beats": beats,
        "speech_envelope": envelope,
        "phrases": phrases,
        "words": words,
        "shots": shots,
    }

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2, ensure_ascii=False)

    print(f"Wrote timeline ({duration:.2f}s, {len(shots)} shots) -> {args.out}")


if __name__ == "__main__":
    main()
