# MIKO BIBLE: measured reference for the "Miko look"

Source: `What If You Could See Everyone's Lie Count - Miko` (1280x720, 30 fps container, 609.9 s).
Images in `docs/miko-ref/`. Everything below is measured or read off frames. Nothing is guessed unless marked (guess).
D = head diameter in pixels. All face numbers are fractions of D.

## 0. What Miko is (and is not)
- Characters are FLAT 2D vector cutouts (no sphere shading, no 3D geometry). The "3D" is only the world behind/around them: perspective set, blurred depth, light shafts, rim light, parallax.
- This is "2.5D": flat cutout characters standing in a perspective diorama. Full 3D characters (spheres/cylinders) were tried on 2026-11-27 and rejected: wrong look.
- Source material runs at about 24 fps on a 30 fps timeline (about 20% of frames are exact repeats), with slow, eased motion. It is calm, not busy.

## 1. Head and face (frames: docs/miko-ref/eyes_closeup.jpg, faces.jpg)
- Head: perfect white circle, very slightly cool lavender gradient toward the shadow side. No hard cel shadow.
- Outline: dark (about #2A1A28, not pure black) ring. Thickness VARIES: about 3.2% D on the shadow side, about 1% D on the lit side.
- Rim light: a warm GOLD crescent hugging the lit side, outside the dark outline, up to about 4% D thick, with a soft glow. It is the signature detail. One side only, the same side as the scene light.
- Hair tuft: a thin swirl/curl stem on top of the head (about 0.12 D tall) on most characters.
- Neck: thin white stick, about 0.13 D wide, dark outlined, short, with a collar notch. The head floats just above it.
- Face is not centred. In a 3/4 turn the whole face block slides toward the turn side (measured shift 0.12-0.22 D).
- Vertical positions (0 = top of head, 1 = bottom): brows 0.29-0.36, eyes 0.52-0.54, mouth 0.70-0.73.
- Eyes: dark ellipses, tiny. Deadpan eyes: width about 0.09 D, height about 0.115 D, with a thick flat upper-lid bar across the top (half-closed, "tired / unimpressed"). Happy / open eyes: width about 0.11 D, height about 0.16 D.
  Each eye has ONE small white catchlight (radius about 0.019 D) at the upper right.
  Eye gap (centre to centre): 0.30 D deadpan, 0.375 D happy.
- Brows: separate short strokes, round caps, slight arch, length about 0.21 D, thickness about 0.03 D, sit about 0.08 D above the eyes. They carry most of the emotion (raised on one side, flat, angled).
- Mouth: tiny. Deadpan = short flat line about 0.14 D wide. Smile = shallow arc about 0.18 D wide. Stroke about 0.018 D, round caps. Very rarely open.
- Blush: only on happy/embarrassed faces, soft pink ellipse.

## 2. Body
- Torso 1.1-1.3 D tall x 0.8 D wide; arms 0.22-0.26 D thick; hands are plain white circles about 0.24 D with outline; legs 0.19 D; neck 0.05 D visible.
- Outline about 2% D on everything (clothes, props too). Thin white highlight streaks on sleeves and jackets (rim of light), not shading.
- Clothes: simple solid colours (suit grey + yellow tie, mustard hoodie, pink blazer, green puffer), few details, but with seams, buttons, collars.

## 3. World, light, colour
- Sets have real perspective (courtroom, street, stairs, restaurant) but are LOW DETAIL and LOW CONTRAST: big flat painted shapes, props also outlined.
- Background is soft (defocused). Characters are the only crisp thing. Many shots have a dark blurred FOREGROUND silhouette head at a frame edge (over-the-shoulder).
- Each scene has its own colour mood: blue-violet night, warm dusk, green-teal office. Light comes from one visible source (lamp, window, candle) with a warm glow; the rim colour is warm gold against cool shadows.
- Light shafts with a few drifting sparkles in some shots (one diagonal beam), not everywhere. No random floating orbs.
- Deep vignette, true blacks, letterbox about 6% top and bottom. Mean luminance about 50/255.
- Plates/tags: dark navy glass box, double white border, white heavy caps. World-space red stamp counters ("9,317") with slight perspective tilt. Info cards for charts.

## 4. Camera and editing
- 184 cuts detected in 610 s: mean shot 3.3 s, median 2.4 s, min 0.07 s, max 22.8 s.
- Shot-type mix (read from docs/miko-ref/shot_variety.jpg, approximate): about 35% medium/close character, 15% prop inserts (stamp, open book, cup, candle with hands entering from the top), 15% wide establishing, 10% over-the-shoulder, 10% silhouette/doorway, 10% counters/graphics, 5% two-shots.
- Within a shot the camera barely moves: a slow push or drift. Background change per frame is LOW: measured mean abs frame diff 0.4 in background regions, 0.6 on the floor, about 1.5 on the character area (0-255 scale, 320x180 gray).
- Our 2026-11-27 renders measured 2.5-2.75 on the background (about 7x too busy) with the same character motion (1.5). That excess motion is what felt "less smooth".

## 5. Pass/fail checklist for every frame we produce
1. Is every character a flat outlined cutout with a gold rim on ONE lit side?
2. Eyes tiny with half-lid or catchlight; brows are separate strokes; mouth tiny; face block shifted when turned?
3. Background soft and low-detail; no random bokeh orbs; no busy patterns in focus?
4. Prop outlines present; colour mood per scene; one visible light source?
5. Background frame-diff <= 0.6 and character-area diff about 1.5 (run `tools/pairdiff.py`).
6. Black fade only; Miko-format plate; letterbox 6%.
If any item fails: remove it, regenerate, re-measure. Do not ship "close enough".
