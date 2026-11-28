# Visual System, Fixed Character Library, Colour Grade, and Miko Overlays

Defines the Ricks-Clips-style 16:9 2.5D visual engine, fixed character library, empirically measured colour grade preset, PostFX/AtmosphereFX from `argon-25d-explainer-engine`, and Miko-borrowed overlays.

## 1. Empirical Ricks Clips Colour Stats (Measured via OpenCV)

- `Ricks_Bank` (lit interior/exterior): `lum_mean = 0.459 [0.24-0.69]`, `sat_mean = 0.349 [0.19-0.57]`, `RGB = (0.49, 0.45, 0.45)`, `shadow(B-R) = +0.021` (warm key + soft cool-blue shadow lift).
- `Ricks_Samurai` (warm tent/campfire night): `lum_mean = 0.294`, `sat_mean = 0.370`, warm practical firelight lighting characters cleanly.
- `Miko_LieCount` (REJECTED GRADE): `lum_mean = 0.252`, heavy dark vignette, moody purple-brown midtones.

Target Grade for `rick-169`:
- Day/Lit Interior: luminance mean `0.45-0.55`, saturation `0.40-0.65`, warm key `#FFF1D6`, soft blue-violet shadows `#6B7DB3`, vignette darkness `<= 0.10`.
- Torch/Lamp Night: luminance mean `0.36-0.48`, warm torch key `#FFAE52`, soft blue-violet only in shadows `#5C6FA6`, vignette darkness `<= 0.12`.

## 2. Character Consistency System (Priority #1)

- Single source of truth: `src/data/characters.json` + shared `CutoutCharacter.tsx` rig.
- Bean/egg-head stickmen (`#F6EFE4` cream skin, `#141414` thin crisp ink outline, stick limbs with rounded joints, vibrant role-coded outfit accents).
- 16 acted emotions from `argon-25d-explainer-engine` (`neutral`, `curious`, `talking_animated`, `shocked`, `skeptical`, `happy_relief`, `nervous_sweat`, `focused_reading`, `confident_point`, `embarrassed_blush`, `sad_slump`, `angry_glare`, `thinking_chin`, `surprised_jump`, `shrug_question`, `celebrate_arms_up`) + 4 RMS/centroid mouth visemes + deterministic `mulberry32` blinks.
- **Mandatory Regression Test:** Render `CharacterConsistencySheet` (all characters x all expressions side by side) after EVERY rig or JSON change.

## 3. PostFX & AtmosphereFX (From `argon-25d-explainer-engine`, Retuned)

- `PostFX`: `<EffectComposer multisampling={0}>`, `<DepthOfField height={360} focalLength={0.025} />`, selective `<Bloom luminanceThreshold={0.90} intensity={0.45} mipmapBlur />`, minimal `<Vignette offset={0.22} darkness={0.10} />`.
- `AtmosphereFX`: Warm golden diagonal light shafts (`#FFF1C1`, opacity `0.075`) + 50 deterministic `mulberry32` drifting dust motes.

## 4. Miko-Borrowed Elements ONLY (Warm-Graded)

1. **Floating Role/Counter Tags (`FloatingRoleTag`):** Clean pill above heads for roles/names/counters (`PRAEGUSTATOR`, `EMPEROR`, `RISK: 80%`).
2. **Infographic Cards (`InfographicCard`):** Warm parchment `#FFFBF2` cards with crisp `#141414` borders, simple icon grids, and oversized stat callouts held `>= 1.8s`.
3. **Macro Close-Up Prop Inserts:** Tight `fov=26` shallow-DoF inserts on hands, goblets, coins, scrolls, and platters.

## 5. 3D Assets & Backdrops Policy

- Zero paid packs. Use included 16 GLB props (when provided), free CC0 models (Poly Haven, Kenney, Quaternius), procedural Three.js toon primitives, and Gemini Image API painted matte backdrops (`GEMINI_API_KEY` from env).
