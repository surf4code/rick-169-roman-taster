# Visual System, Fixed Character Library, Colour Grade, and Miko Overlays

- **Ricks Clips Empirical Reference Stats:** Day `lum = 0.459`, `sat = 0.349-0.57`, warm key light + subtle blue-violet shadow lift (`shadow B-R = +0.021`). Reject Miko's dark `lum = 0.252` heavy-vignette grade.
- **Target Presets (`studio/src/utils/colorGrade.ts`):**
  - `RICK_WARM_BRIGHT_DAY`: `lum 0.45-0.55`, `sat 0.40-0.65`, key `#FFF1D6`, shadows `#6B7DB3`, vignette `<= 0.10`.
  - `RICK_WARM_TORCH_NIGHT`: `lum 0.36-0.48`, warm torch key `#FFAE52`, shadows `#5C6FA6`, vignette `<= 0.12`.
- **Character Consistency (`studio/src/data/characters.json`):** Single JSON + shared `CutoutCharacter.tsx` rig. Bean-head `#F6EFE4`, thin `#141414` ink outline, stick limbs, vibrant role-coded outfits, 16 emotions (`emotions.ts`), 4 RMS mouth visemes. Always re-render `CharacterConsistencySheet` after any change.
- **PostFX & AtmosphereFX:** `DepthOfField height={360}`, selective `Bloom luminanceThreshold={0.90}`, light `Vignette darkness={0.10}`, warm diagonal sunbeams + deterministic `mulberry32` dust motes.
- **Miko-Borrowed Overlays ONLY:** `FloatingRoleTag` above heads, warm-parchment `InfographicCard` (icon grid + big stat), and tight `fov=26` macro prop inserts.
