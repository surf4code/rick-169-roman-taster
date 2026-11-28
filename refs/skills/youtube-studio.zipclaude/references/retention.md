# Retention: loops, breaks, re-hooks, dead zones

Use when: a script feels slow, a draft is long, or analytics show people leaving.
For reading the data itself, see analytics-review.md. This file fixes the script.

Core idea: viewers stay while they believe the next minute is worth it. Every
technique below is a way of making that belief true, not a way of tricking anyone.

## 1. Open loops

An open loop is a question or promise the viewer wants resolved. Keep it honest:
every loop must be paid off inside the video.

Three types:
- **Question loop:** "Why did [thing] fail? I'll show you in section three."
- **Promise loop:** "There's a trick that cuts [real effort] in half. It's last for a reason."
- **Tension loop:** a problem or risk introduced before the solution arrives.

Rules:
- Keep no more than about three loops open at one time.
- Open a loop in the hook, and another before each major section.
- Say where the payoff is only if it is truly coming; do not point at filler.
- If a loop's answer disappoints, the loop was bait. Rewrite it or drop it.

Loop ledger (keep it with the script):

| # | Loop | Opened at | Paid off at | Payoff strong? |
|---|---|---|---|---|
| 1 | ... | hook | beat 4 | yes / no |

All rows need a payoff. Empty "Paid off at" cells fail the check.

## 2. Pattern breaks

A pattern break is any change that refreshes attention. Use at every beat, and
whenever one mode (a face, a voice, a slide) has gone on too long.

| Type | Examples |
|---|---|
| Visual | Cut to B-roll, zoom, screen recording, diagram, prop, new angle |
| Text | Key phrase or number on screen, a list building line by line |
| Audio | Music change, sound effect, a pause, a quieter or louder line |
| Verbal | Switch from explaining to a question, a quick story, a joke |
| Structural | Move from claim to demo, from demo to reaction, from list to deep dive |

Rule: nothing should look and sound the same for more than a stretch you can
justify. When in doubt, add the next break, but do not add effects with no purpose.

## 3. Re-hooks

A re-hook re-earns attention at a point where people tend to drift: after the
setup, at the midpoint, before a slow beat, before the ending.

Templates:
- **Reversal:** "That is what most people believe. Here's where it breaks."
- **Stakes raise:** "Everything so far assumed [X]. If that's wrong, [bigger consequence]."
- **Preview of the best part:** "In two minutes I'll show [specific payoff]. First you need this."
- **New question:** "That answers [old question]. It opens a bigger one: [new question]."
- **Proof drop:** "Here's the actual [file / result / screenshot] so you can judge for yourself."

Place one at roughly every major section boundary, and always at the midpoint of
a 10+ minute video. Keep it to one or two sentences.

## 4. Dead-zone fixes

A dead zone is a stretch with no new information, no tension, and no change.

| Symptom | Likely cause | Fix |
|---|---|---|
| Opens with greetings or "before we start" | Throat-clearing | Cut to the first interesting line |
| Long setup before any payoff | Context dump | Give one sentence of context, move the rest to where it's needed |
| Same point said three ways | Over-explaining | Keep the clearest version, cut the others |
| Recap after every section | Fear of confusion | Recap once at the end |
| Tangent that does not serve the promise | Interesting but off-topic | Cut it, or save for a separate video |
| Flat delivery over static visuals | No change in mode | Add a visual, a question, or a demo |
| Abstract claim, no example | Theory without proof | Add a specific example or show it |
| Cold, slow ending | Energy drop | Move the payoff earlier and end on value |

Three tests to run on any suspicious paragraph:
- **Cut test:** delete it. Does the video still make sense? Then it's gone.
- **So-what test:** if the viewer says "so what?", add the consequence or cut.
- **Skip test:** would you skip this if you were watching? Fix or remove.

## 5. Drop-off diagnosis (script side)

| Where viewers leave | Likely cause | First fix to try |
|---|---|---|
| In the first seconds | Hook doesn't match title or thumbnail, or starts slowly | Rewrite the hook (hooks.md); make the first line deliver the packaged promise |
| Right after the hook | Weak transition into the body | Add a promise line and one re-hook; shorten the setup |
| At a hard cut or topic switch | Abrupt change with no bridge | Add an exit line and a reason to continue |
| Gradual slope throughout | Low density, same rhythm | Raise information per minute; add breaks |
| A dip in the middle | Sag between hook and payoff | Insert a re-hook; move a strong beat earlier |
| During explanations | Too abstract or too long | Add an example or demo; split the beat |
| Before the CTA | Viewers sense the end | Deliver the payoff first, then one short CTA |
| Spike where many rewind | Viewers want that moment again | Study it; give more of that kind of beat |

Fix one thing at a time so you can tell what worked.

## Retention pass (run on a full draft)

- [ ] First line delivers value; no greeting
- [ ] A loop opens in the hook and each is closed by the end
- [ ] A break or visual change at every beat
- [ ] A re-hook at each major boundary, and at the midpoint (10+ min)
- [ ] No tangents; every beat passes the cut test
- [ ] Examples or demos for every abstract claim
- [ ] Payoff comes before the CTA, and the CTA is single
