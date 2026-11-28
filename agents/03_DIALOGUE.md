# DIALOGUE / VOICE
Voice is generated from the EXACT script text, never paraphrased. Narrator: host Akira. Style: Bernard-type second person ("You're born in...").
Output: `script.txt` (final text), `voice_timing.json` (sentence start/end seconds from the generated audio), keep audio in `rick-169/`.
Director uses voice_timing.json to set shot boundaries. If a line changes, regenerate that line only (save credits).
