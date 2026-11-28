# Slop check

Look at a contact sheet of every generated clip (`scripts/contact_sheet.py`, 18 frames) and of the final edit (6-second windows, 27 frames). Go through this list each time. If a single frame fails, the shot fails.

## Sheets

- [ ] Exactly 3 panels, no text or labels.
- [ ] Ball head: no ears, no neck bump, no sculpted nose or eyes. The face is a drawing.
- [ ] Limbs are thin sticks. Hands are small gloves (3D) or dots (2D).
- [ ] The gender reads instantly from the silhouette. A female character has no beard, stubble or moustache from the anchor and has her hairstyle and eyelashes; a male one has only the facial hair the user asked for.
- [ ] Every requested accessory is present on the correct side (earrings, bangles, glasses, hat, tie…).
- [ ] The outfit matches the brief item by item, with nothing extra.
- [ ] The same character and scale in all panels.

## Keyframes

- [ ] The character matches the sheet: gender, hair, hat, outfit, accessories, face style. A woman never gains a beard; background crowds are a mix of men and women, not clones of the anchor's bearded man.
- [ ] Exactly 2 arms and 2 legs per character, and the arms come from the shoulders.
- [ ] The style matches the other keyframes (same render style, same light quality).
- [ ] A repeat location looks like its first appearance: same furniture, same props, same window.
- [ ] Screen and sign text is exactly as written. There are no stray marks.
- [ ] The frame shows what the narration line says.
- [ ] No borders, UI, captions or logos.

## Clips

- [ ] **Limbs.** No third arm and no arm growing from the beard or body. Arms don't thicken into tubes.
- [ ] **Face.** It stays a drawing the whole clip: no sculpted nose appearing, no wrinkles or realistic skin, no eye bags.
- [ ] **Costume.** No new buttons, belts or pockets. The hat doesn't vanish. Accessories don't disappear.
- [ ] **Set.** No object vanishes or appears (monitor, lamp, laptop, plant). Walls and ceilings stay.
- [ ] **Camera.** No zoom or push that throws key props out of frame when they matter. No hidden cut inside the clip (a sudden jump in angle).
- [ ] **Action.** It happens as described. Objects don't change state for no reason (a laptop closing, a door teleporting).
- [ ] **Text.** It stays readable and correctly spelled. Marks (X, check, stamp) land in the right place and only on the right object.
- [ ] **Style.** No switch between 2D and 3D, and no colour or lighting jump mid-clip.
- [ ] **Audio.** No music and no speech in the clip.

## Final edit

- [ ] Every cut lands on a new line. No clip shows a slop frame at its edges.
- [ ] Captions match the words and are readable, not covering the key action or a face.
- [ ] Numbers appear as digits in captions.
- [ ] The hook frame tells where and who at a glance.
- [ ] The last shot holds briefly after the final word.
- [ ] The level is fine: the voice is clear over music and SFX, with no clipping.

## Fix table

| Problem | Fix |
|---|---|
| Slop only in the first or last ~0.5 s | Trim it with `src_in` / `src_out` in `plan.json` |
| Extra or thick arms | Add to the animation prompt: "EXACTLY two thin stick arms coming out of the sleeves at the shoulders, never from the beard or body"; regenerate 2 takes |
| Face turns sculpted or realistic | Add a LOCK paragraph: "the face stays a FLAT drawing… no 3D nose, no wrinkles, no skin"; avoid close-up push-ins on the face; keep a medium shot |
| Costume drift (buttons, lost hat) | Add a LOCK paragraph naming the exact item: "the cap stays on his head the whole shot", "plain tunic, no buttons" |
| Props vanish when the camera moves | Lock the camera: "THE CAMERA IS LOCKED: no move, no zoom" and list every prop that must stay visible |
| Object does the wrong action (closes, flips, teleports) | Make an end frame (prompt 5) and animate start → end; state "stays open / in place the whole time" |
| A character appears inside a place they should only look into | Put the camera behind them on their side: "he stays in the corridor, never goes through the door" |
| Wrong room on a repeat location | Re-make the keyframe with the location's first keyframe as a THE PLACE reference |
| Reference leaks (the wrong era or room bleeds in) | Remove that reference; describe the place in words and say "NOT a {wrong place}" |
| Marks on the wrong object or text over words | Spell out the exact position: "the X stamps INSIDE the checkbox at the right end of the line; the words are never covered" |
| Hidden cut inside a clip | Use only the clean part before or after the cut, or regenerate with "ONE CONTINUOUS SHOT, NO CUTS" at the top |
| False content-filter rejection on a harmless frame | Retry once as is; if it repeats, rephrase the action more neutrally |

Make 2-3 takes for any shot that failed twice, and pick the cleanest one.
