#!/usr/bin/env python3
"""Validate a shots_full.json against the rig. Usage: validate_shots.py shots.json [script.md] [extra_characters.json]"""
import json, re, sys, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cast = set(json.load(open(f"{ROOT}/src/data/characters.json"))["cast"])
if len(sys.argv) > 3:
    txt = open(sys.argv[3]).read()
    m = re.search(r"\{.*\}\s*```", txt, re.S) or re.search(r"\{.*\}", txt, re.S)
    try: cast |= set(json.loads(m.group(0).rstrip("`").strip()))
    except Exception as e: print("extra characters not parsed:", e)
SETS = {"palace_quarters_day","palace_corridor_day","banquet_hall_day","palace_kitchen_day","palace_kitchen_night","infographic_parchment","akira_sage"}
CAMS = {"slow_push","punch_in","low_angle_tilt","top_down_drift","macro_push","slowmo_impact","whip_right","fly_through","corridor_dolly","orbit","crane_down","dutch_punch","static"}
EMO = {"neutral","curious","talking_animated","shocked","skeptical","happy_relief","nervous_sweat","focused_reading","confident_point","embarrassed_blush","sad_slump","angry_glare","thinking_chin","surprised_jump","shrug_question","celebrate_arms_up"}
HERO = {"Goblet","Platter","Jug","Amphora","Bowl"}; ANIM = {"tip"}
raw = open(sys.argv[1]).read().strip()
raw = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.M).strip()
try: shots = json.loads(raw)
except Exception as e:
    # tolerate a truncated file: keep complete lines that parse
    shots = []
    for ln in raw.splitlines():
        ln = ln.strip().rstrip(",")
        if ln.startswith("{"):
            try: shots.append(json.loads(ln))
            except Exception: pass
    print(f"(file is not a complete JSON array; recovered {len(shots)} shots line by line)")
errs = collections.Counter(); detail = collections.defaultdict(set)
def bad(kind, val, sid): errs[kind] += 1; detail[kind].add(str(val))
prev = None
for s in shots:
    sid = s.get("id", "?")
    if s.get("set") not in SETS: bad("unknown set", s.get("set"), sid)
    if s.get("camera") not in CAMS: bad("unknown camera", s.get("camera"), sid)
    if prev and s.get("camera") == prev and s.get("type") is None: bad("same camera twice in a row", prev, sid)
    prev = s.get("camera")
    for key in ("characters", "crowd"):
        for c in s.get(key, []):
            if c["id"] not in cast: bad("unknown character id", c["id"], sid)
            for e in ([x[1] for x in c["emotion"]] if isinstance(c.get("emotion"), list) else [c.get("emotion")]):
                if e not in EMO: bad("unknown emotion", e, sid)
            p = c.get("pos", [0, 0, 0])
            if not (-3.6 <= p[0] <= 3.6 and abs(p[1]) < 0.01 and -5.1 <= p[2] <= 1.1): bad("pos out of range", p, sid)
    for h in (lambda x: x if isinstance(x, list) else [x])(s.get("hero") or []):
        if h.get("t") not in HERO: bad("unknown hero prop", h.get("t"), sid)
        if h.get("anim") and h["anim"] not in ANIM: bad("unsupported hero anim", h["anim"], sid)
    dur = len(re.findall(r"[\w'’-]+", s.get("narration", ""))) / 2.6
    if dur > 8.5: bad("shot narration too long (>8.5 s)", f"{sid} ~{dur:.1f}s", sid)
print(f"{len(shots)} shots, last id: {shots[-1].get('id') if shots else None}")
for k, n in errs.most_common(): print(f"  {n:4d}  {k}: {sorted(detail[k])[:14]}")
if len(sys.argv) > 2:
    script = open(sys.argv[2]).read()
    sents = [x.strip() for x in re.split(r"(?<=[.!?])\s+", re.sub(r"\[[^\]]*\]", " ", script)) if len(x.split()) >= 5]
    narr = " ".join(s.get("narration", "") for s in shots).lower()
    miss = [x for x in sents if x.lower()[:40] not in narr]
    print(f"script coverage: {len(sents)-len(miss)}/{len(sents)} sentences found in shot narrations")
    claims = ["625", "chrysaor", "eridanus", "collegium", "galba", "pompeii", "13th of october", "october thirteenth"]
    for c in claims:
        n = sum(c in s.get("narration", "").lower() for s in shots)
        if n: print(f"  removed claim still in shots: '{c}' x{n}")
