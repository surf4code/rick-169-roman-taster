# ANIMATOR
Files: `CutoutCharacter.tsx` (gestures, IK arms), `StyleTestOpening.tsx` (shots), `utils/cameraModes.ts`.
Time-based motion only (works at 30 and 60 fps). Arms and hands: natural, elbows not visible as joints, smooth eased gestures; mouth envelope follows the voice; blink, small head sway, breathing every frame. Camera: slow, eased, face/eyes shift toward the turn.
Check by rendering two adjacent frames and running `tools/pairdiff.py`: characters ~1.5, background <= 0.6.
