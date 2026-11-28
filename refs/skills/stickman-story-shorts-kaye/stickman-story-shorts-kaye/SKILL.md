---
name: stickman-story-shorts
description: Turns a short text story into a finished 9:16 narrated "stickman" story short (about 45-70 s), using the user's own Higgsfield account through the Higgsfield MCP connector. White-ball-head stickman characters, in flat 2D or stylised 3D; one shot per narration line; voice-over, sound effects, music and 1-2-word burned-in captions. Use whenever the user sends a script or story and wants a stickman / cartoon explainer / story short / YouTube Short / Reel / TikTok made from it, asks for a "stickman video", "story short", "animated short from my script", or sends a hero description or outfit photo for such a video. Also use for follow-ups on a video made this way, like "this shot is slop, redo it", "change the voice" or "make it 3D".
---

# Stickman Story Shorts

You turn the user's script into a finished vertical short. The user brings the story and the characters. You decide the hook, the locations, the shots, the camera, the sound and the edit, and you generate everything on the user's own Higgsfield account through the Higgsfield MCP tools.

Read `references/format.md` (what makes these shorts work) and `references/prompts.md` (proven prompt templates) before you write any prompt. Read `references/slop-check.md` before you review any generation.

## 0. Before you start

- **Higgsfield must be connected.** If no Higgsfield MCP tools are available, ask the user to connect the Higgsfield connector in Claude first and stop.
- **Tools you will use:**
  - `models_explore`, to confirm model params;
  - `media_upload` + `media_confirm`, or `media_upload_widget`, for user files;
  - `generate_image` / `generate_image_batch`;
  - `generate_video` / `generate_video_batch`;
  - `generate_audio` / `generate_audio_batch`;
  - `list_voices`;
  - `jobs_wait`;
  - `show_generation_by_ids`.
- **Credits.** This workflow spends real credits on the user's account. Before the full production (step 5), tell the user roughly how many generations it will take (about 2× the number of lines in images and videos, plus audio). Use `get_cost: true` on one shot to quote a real per-shot price, and wait for a go-ahead.
- **Local tools.** Assembly needs `python3` and `ffmpeg`. If `ffmpeg` is missing, `pip install imageio-ffmpeg` provides one, and the scripts find it automatically. If you cannot run code at all (no code execution or files), still do steps 1-6, then hand the user the ordered clip list, the voice files and the caption timings, and say that final assembly needs a code-capable Claude.
- **Language.** Talk to the user in their language. Prompts to the models are always in English. The narration is in the language of the user's script.

## 1. Intake — ask once, in one message

Read the script, then ask only what you can't decide yourself, in one compact message:

1. **2D or 3D?** Show both options in one line each:
   - **2D**: flat hand-drawn cartoon characters with thick outlines, inside a soft 3D world.
   - **3D**: fully 3D characters with real fabric, hair and props, white ball heads with drawn faces, inside a stylised 3D world.

   If the user does not care, recommend 3D.
2. **Main hero: male or female?** Ask it as the first part of this question, as two clear options: **male** or **female**. If the hero is a known person or the script makes it obvious ("she", "his wife"), don't ask; state your read in one line so the user can correct it. Then ask for a name ("Leonardo da Vinci", "a tired office worker"), a description, or a photo of the look they want. Explain in one line that faces are not copied in this style. Recognisability comes from hair, headwear, glasses, beard, clothes, colours and accessories. A photo of an outfit is more useful than a photo of a face.
3. **Other recurring characters**, if any, the same way, each with male or female. They are optional.
4. **Specific objects** that must look a certain way, like a product, a vehicle or a pet. These are optional too.
5. **Voice.** A male or female narrator, the vibe (energetic, deadpan, warm), or "pick for me".

Locations, shots, camera, sound effects and music are yours. Don't ask about them. Background crowds (office, street, audience) are yours too: make them a natural mix of men and women unless the story says otherwise.

If the user already answered some of these in their first message, don't ask again.

## 2. Script pass — the hook

Do not rewrite the user's story. They wrote it, so keep their words, their facts and their ending.

You may:
- **Split** it into narration lines of about 1-3 seconds of speech each (8-25 words max). Each line becomes one shot. A 60-second script usually gives 15-22 lines.
- **Sharpen the first line into a hook**, only if it is weak, and only with the user's approval. Show the original and your version side by side. The rules for hooks are in `references/format.md`. The hook must come from the script's own content, usually its most absurd or surprising concrete moment or its stakes. Never invent events that are not in the script.
- **Write numbers as digits** in captions ("0.4 seconds", "500 years").

Show the user the numbered line list, with the hook marked, plus a one-line visual idea per line. If the user writes in a non-English language and the script is in English, add a short translation of each line. Wait for "ok" before generating the full set. You can start the character sheets (step 3) in parallel, since they don't depend on the line list.

## 3. Character sheets — the anchors for everything

Make one sheet per recurring character, with `nano_banana_pro` (2k, 16:9). Use the matching template in `references/prompts.md` (2D or 3D), filled with the character's gender from intake (male or female). For a female character, add the female block from the template, because the style anchor is a bearded man and his beard and build leak in otherwise. Use these references in this order:

- `image_1`: the **style anchor**, which is `assets/style_2d.png` or `assets/style_3d.png` from this skill. Upload it with `media_upload`. It is only the source of the drawing or render style and the body plan. The prompt must say to take nothing of the anchor's own character (his beard, cap or clothes).
- `image_2+`: the user's look photos, if any. Say exactly what to take from each (hair from one photo, outfit from another) and what to ignore (the real face, the backdrop).

Generate 2 variants per character, and for an important hero also 1 with `gpt_image_2_6`. Check each one against `references/slop-check.md` → *Sheets*:
- no ears on the ball head;
- thin stick limbs;
- the face is drawn, not sculpted;
- every requested accessory is present;
- no extra panels and no text.

Show the user the best 1-2 and wait for a pick. These sheets are reused in every shot, so a bad sheet ruins the whole video.

## 4. First test — the hook shot

Before producing everything, make **the hook shot only**, through the full pipeline (steps 5a-5c for line 1), and show it to the user with the hook line's voice. This is where the user approves the look, the voice and the energy. Iterate here, because changes later are expensive.

## 5. Production — one shot per line, in order

### 5a. Voice-over first, because it sets every timing

- Pick a voice with `list_voices` (`seed_audio` presets), or follow the user's request. Make the hook line in 3-4 candidate voices and let the user choose by ear. Then generate every line separately with the **same voice and settings** (`generate_audio_batch`).
- Keep each line as its own file (`vo/vo_01.wav` …). Measure the speech with `python scripts/vo_bounds.py vo/*.wav`. Each shot's generation length is `max(3, ceil(speech + 1))` seconds, capped at 10 for image-to-video.
- **The narrator voice must be a stock or preset voice, or a voice the user owns.** Never clone a real, identifiable person's voice without that person's consent. If the user asks to sound "exactly like" a specific creator or celebrity, say so plainly and offer a similar stock voice instead.

### 5b. Keyframes, which lock the style

For every line, generate one **start frame** with `nano_banana_pro` (9:16, 2k), using the keyframe template in `references/prompts.md`. Pass these references:
- the character sheet(s) of who is in the shot;
- for the first shot of every new location, nothing else;
- for later shots in the **same location**, also the first keyframe of that location as a "THE PLACE" reference, so rooms, props and lighting stay identical.

Describe one clear story moment per line, showing literally what the narration says.

Review all keyframes (`references/slop-check.md` → *Keyframes*) before animating, and regenerate the bad ones. It is much cheaper to fix a still than a video.

### 5c. Animate each keyframe

Use `generate_video` with model `gemini_omni_flash_1_2`:
- mode `image-to-video`, the keyframe as `start_image`;
- `aspect_ratio: "9:16"`, `resolution: "1080p"`;
- the duration from 5a.

Use the animation template in `references/prompts.md`. It locks the look, describes the action and the camera, and asks for sound effects only, with no voice and no music. The narration is added in the edit.

When an action keeps going wrong because the model "invents" a move (an object vanishing, a laptop closing instead of turning), generate the **end state as a second still**: edit the keyframe with `nano_banana_pro`. Then pass it as `end_image`, so the model only has to connect two approved frames.

Generate in batches (`generate_video_batch`) and wait with `jobs_wait`. Download every result.

### 5d. Slop check, every clip, every time

Run `python scripts/contact_sheet.py shot.mp4 sheet.jpg 18` for every clip and **look at the sheet**. Check it against the full list in `references/slop-check.md`. The usual offenders:
- extra or third arms;
- a face that turns sculpted or realistic;
- costume pieces appearing (buttons, a second belt);
- the hat vanishing;
- objects popping in or out (a monitor disappearing, a laptop out of nowhere);
- a camera zoom that throws the set out of frame;
- a hidden cut inside the clip;
- wrong or misspelled on-screen text;
- marks on the wrong object.

For each bad clip, choose one fix:
- If the slop is only at the start or end, **trim around it**: set `src_in` / `src_out` in the edit plan so that only clean frames are used.
- Otherwise **regenerate**. Tighten the prompt with an explicit lock on the failed thing (see the fix table in `references/slop-check.md`), and make 2-3 takes. If needed, use start + end frames.

Never ship a clip you have not looked at.

### 5e. Music and SFX

- Clip sound effects come from the video model, and the edit keeps them at about 0.5.
- Music: one instrumental bed of 60 s, made with `elevenlabs_music_v2_5` (`force_instrumental: true`). Playful light orchestral (pizzicato, marimba, clarinet) suits most stories. Match the mood if the story is darker. Use a low volume (0.10-0.16).

## 6. Assemble

Write `plan.json` (the format is documented at the top of `scripts/assemble.py`), then run:

```
python scripts/assemble.py plan.json
```

Each shot lasts exactly as long as its narration line, and the clip is time-fitted to it. Captions are 1-2 words, bold white with a black outline, placed a bit below centre. The voice is on top, then the SFX, then the music.

Then **slop-check the final edit**: run `contact_sheet.py` on 6-second windows with 27 frames each, so you see every ~0.2 s. Look at every sheet: cuts, captions, and anything you trimmed. Fix and re-run.

Deliver the final MP4 to the user. In 3-5 lines, say what was made, which shots were regenerated or trimmed and why, and what they should check by ear (voice, music level). If you could not check something, say so.

## 7. Revisions

Users usually come back with "this moment is slop", "make him do X instead", "change the voice" or "2D instead of 3D". Change only what was asked:
- **Regenerate only the affected shot.** Reuse its keyframe or make a new one, run the slop check, swap it in `plan.json`, re-assemble.
- **New voice:** regenerate all lines in the new voice, re-measure, re-assemble. The clips can stay, because each one is re-timed to its line.
- **2D ↔ 3D:**
  1. Make new sheets in the other style.
  2. Re-render each existing keyframe in the new style, using the old keyframe as the composition reference.
  3. Re-animate.

## Rules

- One shot = one narration line, shown literally. If the line says "his face goes purple", the frame shows exactly that.
- Characters keep the same look in every shot: the same sheet and the same accessories.
- No music, voice or talking inside the generated clips. Narration and music are added in the edit.
- The camera always does something purposeful (push-in, orbit, tracking, tilt). In shots where objects must stay in place, lock the camera and say so.
- Text on screen only where the story needs it (a sign, a screen, a stamp). Spell it out exactly in the prompt and check it.
- Never copy another creator's characters, branding or exact videos. Make original characters in this general style.
- Don't put real people's faces into characters without their consent. Public historical figures as cartoon characters are fine.
