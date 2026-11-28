# Prompt templates

Fill in the `{…}` parts. Keep the blocks in this order. Hard requirements go first. Every reference image gets its own line that says what to take from it and what to ignore.

## 1. Character sheet — 3D

Model: `nano_banana_pro`, 16:9, 2k. References: `image_1` = `assets/style_3d.png`, then the user's look photos.

```
A character design sheet, 16:9, three panels side by side, of a NEW stickman character rendered in EXACTLY the same 3D style as <<<image_1>>>. LEFT: head-and-chest facing camera. CENTRE: full body from the front, top of head to shoes. RIGHT: head-and-chest in profile facing left.

<<<image_1>>> — THE ONLY SOURCE OF THE 3D STYLE AND BODY PLAN: a big smooth matte WHITE ball head with a FLAT drawn black-ink face (two dark oval eyes, thick brush eyebrows, a small curved "c" nose line, a small mouth line), real 3D textured hair and clothing, VERY thin matte black stick arms and legs, black cartoon gloved four-finger hands, soft studio render on a neutral grey backdrop, cute proportions about three heads tall. Take NOTHING of that character himself: not his beard, hair, cap or clothes.
{for each user photo:}
<<<image_N>>> — THE ONLY SOURCE OF {her/his hair | the outfit and accessories | …}: {describe exactly what to take}. Take NOT {the real face | the backdrop | items you don't want}.

THE CHARACTER: a {MAN | WOMAN} — {who they are, in one line}. {hair: colour, length, style}. {headwear}. {glasses / beard / special marks}. {every clothing item, top to bottom, with material and colour}. {every accessory and where it sits}. Expression: {calm / smug / cheerful…}.

The face stays a FLAT drawing on the white ball — never sculpted, no 3D nose, no ears. Hair, clothes and accessories are real 3D materials. Exactly two thin black stick arms coming out of the sleeves and two thin black stick legs. Same character, same outfit, same scale in all three panels. Seamless neutral mid-grey backdrop, soft natural key light.
NEGATIVE: no realistic human face, no skin, no sculpted nose or eyes, no ears, no thick or tube limbs, no human hands, no extra arms, no white backdrop, no text, no logos, no extra panels{, female: no beard, no stubble, no moustache}.
```

**Gender block.** The style anchor is a bearded man, so the gender must be said in words, not left to the model.
- **Male:** `THE CHARACTER: a MAN`. Beard, moustache or a clean shave only as the user described; if nothing was said, clean-shaven.
- **Female:** `THE CHARACTER: a WOMAN`, and add this line right after THE CHARACTER:
  `SHE IS CLEARLY A WOMAN, read from the silhouette alone: {a feminine hairstyle — long hair / ponytail / high bun / bob}, the same flat drawn face with soft longer eyelashes on the eyes and a small neat mouth{, optional: a hint of lip colour}, a slightly slimmer waist in the clothes, {a dress / skirt / blouse — whatever the user asked for, else feminine everyday clothes that fit her role}, {earrings / a necklace / a bag if they fit}. Take NOT the beard, stubble or male build of <<<image_1>>>. The face stays the same simple flat drawing as every other character — no makeup-heavy realism, no lips sculpted in 3D.`
  If the user's outfit is gender-neutral (a suit, a hoodie, a lab coat), let the hair, eyelashes and accessories carry it, and keep the outfit as asked.

## 2. Character sheet — 2D

Model: `nano_banana_pro` (or `gpt_image_2_6`), 16:9. References: `image_1` = `assets/style_2d.png`, then the user's photos.

The template is the same as the 3D one, with these changes:
- Swap the style lines for: `a flat hand-drawn vector cartoon — a big plain white egg-shaped head with no ears and no neck, a tiny doodle face (small black dot eyes, short thick eyebrow dashes, a small "c" nose line, a small mouth line), a small bean-shaped torso, thin dark-navy stick arms and legs with small round dot hands, a THICK even dark-navy outline around every shape and flat colour fills with one soft cel-shade tone.`
- Replace the materials sentence with: `EVERYTHING is flat 2D: hair, clothes and accessories are simple flat shapes with the thick outline, flat colours and one cel-shade tone.`
- Add to the negative: `no 3D render, no textures, no fur, no realistic hair strands, no gradients`.

## 3. Shot keyframe (start frame)

Model: `nano_banana_pro`, 9:16, 2k. References: the sheet(s) of the characters in the shot. For a repeat location, also add the first keyframe of that location.

```
A single still frame, 9:16 vertical, from a {high-end stylised 3D animated film | 2D cartoon placed in a stylised 3D world}.

STYLE: {3D: everything is real 3D — world, props and characters — premium animated-feature render, soft global illumination, real materials, gentle depth of field, rich cinematic colour. Characters look exactly like their sheets: white ball heads with FLAT drawn faces, real 3D hair and clothes, thin black stick limbs with black gloves.}
{2D: characters are FLAT 2D drawings with a thick dark-navy outline and flat colours, exactly like their sheets; the world is a stylised 3D set with real depth and soft cinematic light; the flat characters cast soft shadows in it.}
Every character has EXACTLY two arms and two legs.

<<<image_1>>> — {NAME}, a {man | woman}, THE ONLY SOURCE OF HOW HE/SHE LOOKS: {short list of the defining features from the sheet, for a woman including her hairstyle and eyelashes}. Ignore the sheet's grey backdrop and panel layout.
{<<<image_2>>> — {NAME 2}, …}
{<<<image_N>>> — THE PLACE: the exact same {room}, same layout, props, colours and light. Characters come only from their own references.}

THE FRAME: {location, time of day, light source, key props, all concrete}. {camera angle and shot size}. {If there is a background crowd: "the background people are a natural mix of men and women, with varied hair and clothes, all clean-shaven unless they are clearly old men"}.
THE MOMENT: {exactly what the narration line says, as a frozen beat: pose, expression, what's in hands}.
TEXT: {"the only readable text is EXACTLY: …" | "no readable text"}.
NEGATIVE: no extra arms, no third hand, no thick tube limbs, no realistic faces, no ears, no sculpted noses, {3D: no flat 2D drawing, no outlines | 2D: no 3D characters}, no captions, no subtitles, no logos, no brand names, no borders, full frame edge to edge.
```

## 4. Animate the keyframe

Model: `gemini_omni_flash_1_2`, mode `image-to-video`, `start_image` = the keyframe (+ `end_image` if needed), 9:16, 1080p, duration from the voice-over.

```
9:16 vertical. {N} SECONDS. ONE CONTINUOUS SHOT, NO CUTS. Animate the start image.

KEEP THE START IMAGE'S LOOK EXACTLY for the whole shot: the same characters with their drawn faces, hair, clothes and accessories, EXACTLY two thin stick arms and two legs each; the same world, light and colours. Characters never change face, costume or style, never gain or lose limbs or accessories. Every object, wall and ceiling stays solid and in place; nothing appears from nowhere or vanishes.

{Optional lock, when a sheet detail tends to drift: "HIS LOOK IS LOCKED: … no 3D nose, no buttons on the tunic, the cap stays on his head …"}

THE ACTION: {one clear action matching the narration line, physically simple, start → end}.
THE CAMERA: {slow push-in | orbit | tracking along … | crane up | LOCKED, no move, no zoom}.

AUDIO: only realistic sound effects — {list 2-4 concrete sounds}. NO music, NO voice, NO talking, NO narrator.
NEGATIVE: no cuts, no style change, no extra limbs, no third arm, no morphing, no flicker, no disappearing objects, no captions, no subtitles, no logos, no music, no speech.
```

## 5. End frame (when an action keeps failing)

Model: `nano_banana_pro`, with the keyframe as `image_1`.

```
Edit <<<image_1>>>: keep EVERYTHING exactly the same — the same place, props, characters, faces, clothes, camera angle, framing, style and light. Change ONLY: {the end state, e.g. "the open laptop is rotated so its open screen faces the camera, showing …"}. Exactly two arms. Full frame, 9:16.
```

Then animate with `start_image` = the keyframe and `end_image` = this frame. In the action, say it plainly: "{object} stays {open/in place} the whole time; he simply {does X} until it matches the end image."

## 6. Re-render an existing shot in the other style (2D ↔ 3D)

Model: `nano_banana_pro`. `image_1` = the old keyframe, then the new-style sheets.

```
A single still frame, 9:16 vertical. RE-RENDER <<<image_1>>> AS {FULL 3D | FLAT 2D CHARACTERS IN A 3D WORLD}. Keep this exact composition, camera angle, framing, place, props, pose, action, expression and any on-screen words. Only the rendering style changes. {style block from template 3} {character reference lines}
```

## 7. Voice

Use `seed_audio` with a preset voice from `list_voices`. Send the line text as-is, with no stage directions in brackets (they get read aloud or slow the read down). If the read is too slow, raise `speech_rate` (around 20-30 makes a punchy storyteller pace). Generate the hook in 3-4 voices for the user to choose from, then make every line in the chosen voice with identical settings.

## 8. Music

Use `elevenlabs_music_v2_5`, `force_instrumental: true`, duration 60:

```
Instrumental background music for a funny animated story short. Playful, curious, mischievous storyteller vibe: plucky pizzicato strings, light marimba and glockenspiel, soft upright bass, brushed light percussion, a whimsical clarinet melody. Steady medium tempo around 110 BPM. Light and unobtrusive so a narrator's voice sits clearly on top. No vocals, no drops, no big builds.
```

Adjust the instruments and mood to the story: tense → low strings and a ticking clock; wholesome → acoustic guitar and glockenspiel.
