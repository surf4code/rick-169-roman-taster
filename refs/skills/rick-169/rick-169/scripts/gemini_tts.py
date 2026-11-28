#!/usr/bin/env python3
"""Generate narration WAV using Gemini API TTS. Reads GEMINI_API_KEY from env."""
import argparse, base64, json, os, sys, urllib.request, wave

def synth_chunk(api_key: str, model: str, text: str, voice: str, style_prompt: str) -> bytes:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": f"{style_prompt}\n\n{text}"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    req = urllib.request.Request(
        f"{url}?key={api_key}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    return base64.b64decode(part["data"])

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("ERROR: GEMINI_API_KEY is not set in environment.")
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--voice", default="Charon")
    ap.add_argument("--model", default=os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts"))
    ap.add_argument("--out", default="public/audio/voice.wav")
    args = ap.parse_args()

    style = (
        "Read in a calm, dry, slightly sarcastic modern documentary storytelling voice "
        "at roughly 155 words per minute. Keep dark events understated and clear."
    )
    chunks = [p.strip() for p in open(args.script, encoding="utf-8").read().split("\n\n") if p.strip()]
    pcm_all = bytearray()
    pause = b"\x00\x00" * int(24000 * 0.30)
    for i, c in enumerate(chunks, 1):
        print(f"[gemini_tts] Synthesizing chunk {i}/{len(chunks)} ({len(c.split())} words)")
        pcm_all.extend(synth_chunk(api_key, args.model, c, args.voice, style))
        pcm_all.extend(pause)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with wave.open(args.out, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(bytes(pcm_all))
    print(f"[gemini_tts] Saved -> {args.out}")

if __name__ == "__main__":
    main()
