#!/usr/bin/env python3
import argparse
import json
import math
import os
import subprocess
import sys
import numpy as np

SHOT_GRAMMARS = [
    "card_01_wide_diorama_push",
    "card_02_medium_twoshot_orbit",
    "card_03_closeup_rack_focus",
    "card_04_ots_foreground_blur",
    "card_05_floating_counter_pop",
    "card_06_whip_pan_transition",
    "card_07_crowd_parallax_truck",
    "card_08_isometric_data_chart",
    "card_09_dutch_angle_shock",
    "card_10_spotlight_isolation",
    "card_11_scale_pullback_reveal",
    "card_12_bookend_horizon_hold",
]

ENVIRONMENTS = [
    "apartment_courtyard",
    "kitchen_morning",
    "city_bus_interior",
    "lecture_hall",
    "street_crosswalk",
    "minimal_data_void",
]

EMOTIONS = [
    "curious", "talking_animated", "shocked", "skeptical",
    "happy_relief", "nervous_sweat", "focused_reading", "confident_point"
]


def get_duration_ffprobe(audio_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ]
    return float(subprocess.check_output(cmd, text=True).strip())


def extract_speech_features(audio_path: str, fps: int = 30):
    try:
        import librosa
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        duration = float(len(y) / sr)
        hop = max(1, int(sr / fps))
        rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
        p95 = float(np.percentile(rms, 95)) if len(rms) > 0 else 1.0
        norm_rms = np.clip(rms / max(p95, 1e-6), 0.0, 1.0).tolist()

        # Spectral centroid helps distinguish 'o' vs 'open' mouth shapes
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
        c_max = float(np.percentile(centroid, 95)) if len(centroid) > 0 else 3000.0
        norm_centroid = np.clip(centroid / max(c_max, 1.0), 0.0, 1.0).tolist()

        intervals = librosa.effects.split(y, top_db=30)
        segments = [
            {"start": round(float(s / sr), 3), "end": round(float(e / sr), 3)}
            for s, e in intervals if (e - s) / sr >= 0.25
        ]
        return duration, [round(v, 3) for v in norm_rms], [round(c, 3) for c in norm_centroid], segments
    except ImportError:
        duration = get_duration_ffprobe(audio_path)
        frames = int(math.ceil(duration * fps))
        env = [round(abs(math.sin(i * 0.42)) * 0.78, 3) for i in range(frames)]
        cent = [round(0.4 + 0.3 * math.cos(i * 0.25), 3) for i in range(frames)]
        segments = []
        t = 0.0
        while t < duration:
            nxt = min(duration, t + 4.8)
            segments.append({"start": round(t, 3), "end": round(nxt, 3)})
            t = nxt
        return duration, env, cent, segments


def transcribe_whisper(audio_path: str):
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segs, _ = model.transcribe(audio_path, word_timestamps=True)
        phrases, words = [], []
        for s in segs:
            phrases.append({
                "start": round(s.start, 3),
                "end": round(s.end, 3),
                "text": s.text.strip()
            })
            for w in (s.words or []):
                words.append({
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                    "word": w.word.strip()
                })
        return phrases, words
    except Exception:
        return [], []


def extract_bgm_grid(bgm_path: str, fps: int = 30):
    if not bgm_path or not os.path.exists(bgm_path):
        return 120.0, []
    try:
        import librosa
        y, sr = librosa.load(bgm_path, sr=22050, mono=True)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr)
        bpm = float(np.atleast_1d(tempo)[0])
        return round(bpm, 2), [int(round(float(t) * fps)) for t in beat_times]
    except Exception:
        return 120.0, []


def build_shots(duration: float, phrases: list, segments: list, fps: int = 30):
    anchors = phrases if phrases else segments
    if not anchors:
        anchors = [{"start": 0.0, "end": duration, "text": ""}]

    shots = []
    cur_start = 0.0
    idx = 0
    texts = []

    for item in anchors:
        if item.get("text"):
            texts.append(item["text"])
        span = item["end"] - cur_start
        if span >= 4.5 or item == anchors[-1]:
            end_t = duration if item == anchors[-1] else item["end"]
            grammar = SHOT_GRAMMARS[idx % len(SHOT_GRAMMARS)]
            env = ENVIRONMENTS[(idx // 2) % len(ENVIRONMENTS)]
            shots.append({
                "shot_id": f"shot_{idx + 1:02d}",
                "start_sec": round(cur_start, 3),
                "end_sec": round(end_t, 3),
                "start_frame": int(round(cur_start * fps)),
                "end_frame": int(round(end_t * fps)),
                "camera_card": grammar,
                "environment": env,
                "speaker_emotion": EMOTIONS[idx % len(EMOTIONS)],
                "listener_emotion": EMOTIONS[(idx + 3) % len(EMOTIONS)],
                "floating_counter": (idx + 1) * 12 if idx % 2 == 0 else None,
                "narration": " ".join(texts).strip(),
                "sfx_events": [
                    {"frame": int(round(cur_start * fps)), "type": "whoosh_transition"},
                    {"frame": int(round((cur_start + 0.45) * fps)), "type": "pop_badge"}
                ]
            })
            cur_start = end_t
            texts = []
            idx += 1
    return shots


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--bgm", default="")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out", default="src/timeline.json")
    args = ap.parse_args()

    duration, rms, centroid, segments = extract_speech_features(args.voice, args.fps)
    phrases, words = transcribe_whisper(args.voice)
    bpm, beat_frames = extract_bgm_grid(args.bgm, args.fps)
    shots = build_shots(duration, phrases, segments, args.fps)

    data = {
        "fps": args.fps,
        "duration_sec": round(duration, 3),
        "total_frames": int(math.ceil(duration * args.fps)),
        "bgm_bpm": bpm,
        "beat_frames": beat_frames,
        "speech_envelope": rms,
        "speech_centroid": centroid,
        "phrases": phrases,
        "words": words,
        "shots": shots,
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[analyze_audio] Saved {len(shots)} shots ({duration:.2f}s) -> {args.out}")


if __name__ == "__main__":
    main()
