#!/usr/bin/env python3
"""Generate 16:9 warm bright toon backdrops via Gemini Image API. Reads GEMINI_API_KEY from env."""
import argparse, base64, json, os, sys, urllib.request

STYLE_LOCK = (
    "warm bright 3D toon storybook backdrop, golden sunlit key light, soft blue-violet shadows, "
    "clean highlights, crisp readable shapes, no characters, no people, no text, no watermark, 16:9"
)

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("ERROR: GEMINI_API_KEY is not set in environment.")
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--model", default=os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image"))
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{args.model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": f"{args.prompt}. {STYLE_LOCK}"}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    req = urllib.request.Request(
        f"{url}?key={api_key}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    for p in data["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
            with open(args.out, "wb") as f:
                f.write(base64.b64decode(p["inlineData"]["data"]))
            print(f"[gemini_backdrop] Saved -> {args.out}")
            return
    sys.exit("ERROR: No image returned by Gemini API.")

if __name__ == "__main__":
    main()
