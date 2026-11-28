# rick-169 Production Studio

Complete turnkey 16:9 (`1920x1080`, `30 fps`) Remotion + Three.js studio powered by the `rick-169` skill.

## Quick Start (ThinkPad T430 or GitHub Actions)

```bash
cd studio
npm install
npm run test:chars        # 1. Render Character Consistency Sheet
npm run bench:shot1       # 2. Benchmark Shot 1 (reports exact seconds/frame)
npm run render:styletest  # 3. Render 75s Phase 1 Opening Style Test
```

## Gemini API Media (Environment Variable Only)

```bash
export GEMINI_API_KEY="your-key"
python3 scripts/gemini_tts.py --script script_clean.txt --voice Charon --out public/audio/voice.wav
python3 scripts/analyze_audio.py --voice public/audio/voice.wav --fps 30 --out src/timeline.json
python3 scripts/check_timeline.py src/data/styleTestShots.json
```

## Akira Host Image

Drop your Akira reference PNG into `studio/public/assets/akira_ref.png`. Until then, `AkiraCutaway.tsx` renders a clean sage-green `#9CAF88` placeholder.
