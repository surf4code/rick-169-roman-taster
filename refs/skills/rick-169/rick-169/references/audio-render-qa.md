# Gemini API Media, Audio Sync, QA Gates, and GitHub Actions Render

All API keys are read strictly from environment variables (`GEMINI_API_KEY`).

## 1. Pipeline Commands

1. **Gemini TTS Narration:** `python3 scripts/gemini_tts.py --script script_clean.txt --voice Charon --out public/audio/voice.wav`
2. **Gemini Painted Backdrops:** `python3 scripts/gemini_backdrop.py --prompt "..." --out public/backdrops/banquet.png`
3. **Word Timestamps + RMS Lip-Sync:** `python3 scripts/analyze_audio.py --voice public/audio/voice.wav --fps 30 --out src/timeline.json`
4. **Pre-Render QA Gate (`video-director`):** `python3 scripts/check_timeline.py src/timeline.json` (must exit 0 / zero ERRORs)
5. **Single-Shot Speed Benchmark:** Render 90 frames (`--frames=0-89`) and report `seconds/frame` before launching the matrix.
6. **Parallel Matrix Render:** Trigger `.github/workflows/render-matrix.yml` (`chunks <= 40`, public repo) -> `ffmpeg` concat -> `-14 LUFS` audio mux.
7. **Post-Render QA Gate (`video-director`):** `python3 scripts/qa_video.py out/final.mp4 --out out/qa/ --beats src/timeline.json`
8. **Ricks Clips Colour Grade Comparison:** `python3 scripts/compare_ricks_grade.py --render out/style_test.mp4 --ref_dir refs/ricks --out out/qa/grade_compare.jpg`
