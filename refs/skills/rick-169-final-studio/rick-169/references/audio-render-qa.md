# Audio, Gemini API Media, QA Gates, and Parallel Render

- Always read `GEMINI_API_KEY` from environment variables. Never print, store, or commit keys.
- `scripts/gemini_tts.py` -> narration WAV
- `scripts/gemini_backdrop.py` -> warm bright 16:9 painted backdrops
- `scripts/analyze_audio.py` -> faster-whisper word timestamps + librosa RMS lip-sync
- `scripts/check_timeline.py` -> pre-render timeline QA gate (0 ERRORs required)
- `scripts/benchmark_shot.py` -> renders 90 frames of Shot 1 and prints `seconds/frame`
- `.github/workflows/render-matrix.yml` -> max 40 parallel chunks + ffmpeg concat + `-14 LUFS` mux + `scripts/qa_video.py`
- `scripts/compare_ricks_grade.py` -> luminance/saturation check + side-by-side sheet vs Ricks Clips
