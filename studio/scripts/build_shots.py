#!/usr/bin/env python3
"""Builds src/data/styleTestShots.json from the Phase-1 narration in royal-food-taster-research-and-story.md.
Timing is derived from word counts (~2.6 words/s) so the visuals follow the voice. Re-run after editing."""
import json, os, re
FPS = 30
WPS = 2.6
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def dur(text, minimum=2.4):
    return max(minimum, round(len(re.findall(r"[\w'’-]+", text)) / WPS, 1))

C = lambda id, x, emo, z=0.0, s=1.0, flip=False: {"id": id, "pos": [x, 0, z], "emotion": emo, "scale": s, "flipX": flip}
shots = []
def shot(id, text, set, cam, chars=(), crowd=(), d=None, grade="day", type="shot", **kw):
    shots.append(dict(id=id, narration=text, set=set, camera=cam, characters=list(chars), crowd=list(crowd), grade=grade, type=type, _d=d if d else dur(text), **kw))

# --- Beat 1: born into the household ---
shot("S01", "You're born in Rome, in the year 31, and you already have an owner.", "palace_quarters_day", "slow_push",
     [C("mother", -0.9, [[0,"nervous_sweat"],[2.6,"sad_slump"]]), C("taster_protagonist", 0.5, "happy_relief", 0.3, 0.42)],
     [C("servant_a", -3.2, "neutral", -1.2, 0.8), C("servant_b", 3.3, "neutral", -1.0, 0.8)], stamp="31 AD - ROME",
     tags=[{"who": 0, "text": "SLAVE (PALACE STAFF)", "color": "#059669", "at": 1.6}])
shot("S02", "It isn't your mother. It isn't your father. It's the emperor.", "banquet_hall_day", "low_angle_tilt",
     [C("claudius", 0.3, [[0,"neutral"],[2.0,"confident_point"]], -0.5)], [C("palace_guard", -2.6, "neutral", -1.2, 0.9), C("palace_guard", 2.8, "neutral", -1.2, 0.9, True), C("servant_b", -1.4, "neutral", -1.8, 0.8)],
     tags=[{"who": 0, "text": "YOUR OWNER: THE EMPEROR", "color": "#7E22CE", "at": 2.0}])
shot("S03", "Your mother is a slave in the imperial household, which makes you one too.", "palace_quarters_day", "orbit",
     [C("mother", -0.8, "sad_slump"), C("taster_protagonist", 0.7, [[0,"curious"],[2.8,"shocked"]], 0.3, 0.42)], [C("servant_a", 3.4, "neutral", -1.4, 0.8)],
     tags=[{"who": 1, "text": "ALSO A SLAVE", "color": "#2563EB", "at": 2.8}])
shot("S04a", "The Romans have a word for a baby like you: verna.", "palace_quarters_day", "punch_in",
     [C("taster_protagonist", 0.2, "shocked", 0.2, 0.55)], [], d=3.2, bubble={"who": 0, "text": "WAAAH!", "at": 0.5})
shot("S04b", "A slave born in the house. Like the furniture, but louder.", "infographic_parchment", "static", type="infographic_card", d=4.6,
     infographic={"title": "ROMAN WORD OF THE DAY", "stat": "VERNA", "sub": "a slave born in the house.", "items": ["BORN IN THE HOUSE", "OWNED FROM DAY ONE", "NO SAY IN ANYTHING", "LIKE FURNITURE, BUT LOUDER"]})
shot("S05", "Nobody asks what you think. You're three days old.", "palace_quarters_day", "dutch_punch",
     [C("taster_protagonist", 0.0, "neutral", 0.3, 0.55)], [], bubble={"who": 0, "text": "...", "at": 0.8})
# --- Beat 2: the palace is a machine ---
shot("S06a", "The palace is enormous. Cooks, doorkeepers, accountants,", "palace_corridor_day", "corridor_dolly",
     [C("cook", -1.0, "talking_animated", 0.2), C("scribe", 1.1, "focused_reading", -0.4)],
     [C("palace_guard", -2.3, "neutral", -3.0, 0.9), C("servant_a", 2.3, "neutral", -3.5, 0.9), C("servant_b", 0.0, "neutral", -5.0, 0.9)], d=3.6,
     tags=[{"who": 0, "text": "COOK", "color": "#EA580C", "at": 0.6}, {"who": 1, "text": "ACCOUNTANT", "color": "#0E7490", "at": 1.4}])
shot("S06b", "and people whose only job is the emperor's clothes.", "banquet_hall_day", "whip_right",
     [C("servant_b", -1.1, "nervous_sweat"), C("servant_a", 0.9, "shrug_question")], [C("palace_guard", 3.0, "neutral", -1.0, 0.9)], d=3.2,
     tags=[{"who": 0, "text": "EMPEROR'S WARDROBE", "color": "#BE123C", "at": 1.0}])
shot("S06c", "Everyone has a role. Everyone is replaceable.", "palace_kitchen_day", "slow_push",
     [C("cook", -1.4, "angry_glare"), C("servant_a", 0.1, "sad_slump", 0.3), C("servant_b", 1.5, "shrug_question")],
     [C("scribe", -3.4, "neutral", -0.8, 0.9), C("palace_guard", 3.3, "neutral", -0.8, 0.9)], d=3.4,
     tags=[{"who": 2, "text": "REPLACEABLE", "color": "#64748B", "at": 1.9}])
# --- Beat 3: growing up ---
shot("S07a", "You grow up in the corridors, learning the rules before you learn to read.", "palace_corridor_day", "fly_through",
     [C("taster_protagonist", 0.0, "curious", 0.2, 0.7)], [C("palace_guard", -2.2, "neutral", -3.0, 0.9), C("servant_b", 2.2, "neutral", -4.0, 0.9)], d=4.2)
shot("S07b", "Walk fast. Look down.", "palace_corridor_day", "punch_in",
     [C("taster_protagonist", 0.0, "nervous_sweat", 0.2, 0.7)], [C("palace_guard", -1.9, "angry_glare", -1.8, 0.95)], d=2.6,
     bubble={"who": 0, "text": "WALK FAST. LOOK DOWN.", "at": 0.3})
shot("S07c", "Never touch the food.", "palace_kitchen_day", "dutch_punch",
     [C("taster_protagonist", -0.6, [[0,"surprised_jump"],[0.8,"nervous_sweat"]], 0.3, 0.7), C("cook", 1.0, "angry_glare")], [], d=2.6,
     bubble={"who": 1, "text": "NEVER TOUCH THE FOOD!", "at": 0.4})
shot("S08", "That last rule matters. Because in this house, food is not just food.", "palace_kitchen_day", "macro_push",
     [], [], d=4.8, hero=[{"t": "Platter", "p": [-0.15, 0.87, -1.65], "s": 1.15, "o": {"kind": "mushroom"}}, {"t": "Goblet", "p": [0.45, 0.87, -1.5], "s": 1.3}])
# --- Beat 4: dying at dinner ---
shot("S09a", "The thing is, powerful Romans have a habit of dying at dinner.", "banquet_hall_day", "top_down_drift",
     [C("claudius", 0.0, "happy_relief", -0.9)], [C("nero", 2.0, "happy_relief", -1.2, 0.9), C("agrippina", -2.0, "skeptical", -1.4, 0.9)], d=3.6,
     tags=[{"who": 0, "text": "EMPEROR CLAUDIUS", "color": "#7E22CE", "at": 1.0}])
shot("S09b", "A cup of wine, a plate of mushrooms,", "banquet_hall_day", "slowmo_impact",
     [], [], d=3.4, hero=[{"t": "Goblet", "p": [0.0, 0.87, -1.5], "s": 1.5, "anim": "tip"}, {"t": "Platter", "p": [-0.5, 0.87, -1.7], "s": 1.0, "o": {"kind": "mushroom"}}])
shot("S09c", "and the empire changes hands before dessert.", "banquet_hall_day", "whip_right",
     [C("claudius", -0.6, [[0,"happy_relief"],[1.2,"shocked"],[2.3,"sad_slump"]], -0.8)], [C("agrippina", 2.4, [[0,"neutral"],[1.6,"happy_relief"]], -1.6, 1.0), C("nero", 3.4, "happy_relief", -2.0, 0.9)], d=3.6,
     tags=[{"who": 0, "text": "NEXT ON THE MENU", "color": "#BE123C", "at": 1.6}])
shot("S10", "So the palace has a solution: someone who eats first.", "palace_kitchen_day", "punch_in",
     [C("halotus", -0.2, [[0,"thinking_chin"],[1.8,"nervous_sweat"]], 0.1), C("cook", 1.8, "nervous_sweat", -0.2, 0.95)], [], d=3.8,
     tags=[{"who": 0, "text": "FIRST TO EAT", "color": "#D4A017", "at": 1.2}])
# --- Beat 5: the question ---
shot("S11a", "Years pass, and you turn nineteen.", "palace_quarters_day", "slow_push",
     [C("taster_protagonist", 0.4, "neutral", 0.2, 1.0)], [C("servant_a", -3.2, "neutral", -1.4, 0.8)], d=3.0, stamp="50 AD - AGE 19")
shot("S11b", "One morning, a tired freedman studies you for a long time, then asks one question.", "palace_corridor_day", "orbit",
     [C("halotus", -0.9, "skeptical"), C("taster_protagonist", 0.9, "nervous_sweat")], [C("palace_guard", -2.3, "neutral", -3.0, 0.9)], d=4.6,
     tags=[{"who": 0, "text": "HALOTUS - SENIOR TASTER", "color": "#D4A017", "at": 1.2}])
shot("S12", "Do you have a strong stomach?", "palace_corridor_day", "punch_in",
     [C("halotus", 0.0, "skeptical", 0.2)], [], d=2.6, bubble={"who": 0, "text": "DO YOU HAVE A STRONG STOMACH?", "at": 0.2})
shot("S13", "You nod.", "palace_corridor_day", "dutch_punch",
     [C("taster_protagonist", 0.0, [[0,"nervous_sweat"],[1.0,"sad_slump"]], 0.2)], [], d=2.0)
shots_akira = dict(id="S14", narration="Wrong answer.", set="akira_sage", camera="static", type="akira_cutaway", akiraExpression="deadpan", bubble={"text": "WRONG ANSWER."}, characters=[], crowd=[], grade="day", _d=2.4)
shots.append(shots_akira)
shot("S15", "Congratulations. You're now a praegustator.", "palace_kitchen_day", "crane_down",
     [C("taster_protagonist", 0.0, [[0,"happy_relief"],[1.5,"shocked"]], 0.2), C("halotus", -2.0, "confident_point", -0.2)], [C("cook", 2.3, "shrug_question", -0.6, 0.95)], d=3.4,
     tags=[{"who": 0, "text": "PRAEGUSTATOR", "color": "#2563EB", "at": 1.0}])
shot("S16", "And your job is to die, so the emperor doesn't have to.", "palace_kitchen_night", "slow_push",
     [C("taster_protagonist", -0.4, [[0,"sad_slump"],[3.0,"nervous_sweat"]], 0.3)], [C("claudius", 2.6, "happy_relief", -1.3, 1.0), C("halotus", -2.6, "neutral", -1.0, 0.95)], d=5.2, grade="night_torch",
     hero=[{"t": "Goblet", "p": [0.9, 0.87, -1.4], "s": 1.6}])

t = 0.0
out = []
for s in shots:
    d = s.pop("_d")
    s["start"] = round(t, 3); s["end"] = round(t + d, 3); t += d
    out.append(s)
total = round(t * FPS)
data = {"meta": {"title": "Why It Sucks to Be a Royal Food Taster (in Ancient Rome) - Style Test", "fps": FPS, "width": 1920, "height": 1080,
                 "duration_sec": round(t, 2), "total_frames": total, "clock": "voice", "loop": False},
        "terms": ["PRAEGUSTATOR", "VERNA", "ANCIENT ROME"], "shots": out}
json.dump(data, open(os.path.join(ROOT, "src/data/styleTestShots.json"), "w"), indent=1)
words = sum(len(re.findall(r"[\w'’-]+", s["narration"])) for s in out)
print(f"{len(out)} shots, {t:.1f}s, {total} frames, {words} narration words")
