---
name: youtube-studio
description: Plan, write, package and review YouTube videos end to end - hooks, video structures, retention fixes, research and fact-checking, titles and thumbnails, SEO and chapters, Shorts repurposing, analytics review, and creator voice matching. Extends the youtube-script skill. Make sure to use this skill whenever the user mentions a YouTube script, video outline, hook, intro, title, thumbnail, description, chapters, tags, Shorts, retention, watch time, CTR, drop-off, channel analytics, or "write like my channel", even if they only ask for one small piece. Generic YouTube only; not for blog posts or other platforms.
---

# YouTube Studio

A pure-instructions toolkit for YouTube work. No API keys, no scripts, no internet
calls needed. It extends `youtube-script`: if that skill is installed, keep its
overall output shape (hook, body sections, CTA, metadata, thumbnail) and use the
files here to make each part stronger. If it is not installed, this file stands alone.

All content here is original and open. Reuse, edit and share it freely.

## Router: task -> file

Read only the file(s) the task needs. Do not load all nine.

| The user wants... | Read | You produce |
|---|---|---|
| Hooks, intros, first 30 seconds | `references/hooks.md` | 3+ scored hook options |
| Outline or shape for a video (any length or format) | `references/structures.md` | Beat-by-beat outline |
| Fix pacing, boring middle, "people leave" | `references/retention.md` | Loop ledger, re-hooks, cuts |
| Topic research, fact-check, notes or transcript -> script beats | `references/research.md` | Scored facts, source log, beats |
| Titles and thumbnails | `references/titles-thumbnails.md` | Title set + 3 thumbnail concepts |
| Description, chapters, tags, keywords | `references/seo-chapters.md` | Ready-to-paste metadata |
| Cut a long video into Shorts | `references/shorts-repurpose.md` | 3-5 Short briefs |
| Read analytics, decide what to change | `references/analytics-review.md` | 3 findings, 1 hypothesis, 1 change |
| Match a creator's voice | `references/voice.md` | Voice profile |

Common combos:
- **Full script from an idea:** voice (if samples exist) -> research -> structures -> hooks -> retention -> titles-thumbnails -> seo-chapters.
- **Fix an existing script:** retention -> hooks -> structures.
- **Post-publish review:** analytics-review -> retention (script-side fix) -> titles-thumbnails (packaging fix).
- **Repurpose:** shorts-repurpose -> hooks -> seo-chapters (for the Short descriptions).

## Intake (ask only what is missing, one round)

1. Topic and the single promise of the video.
2. Viewer: who, what they already know.
3. Length goal: short (5-8 min), standard (10-15), long (20-25), or a Short.
4. Format: story, list, explainer, essay, documentary (see structures.md).
5. The one action wanted at the end (subscribe, link, next video, comment).
6. Presentation: talking head, screencast, voiceover plus visuals.
7. Language and tone (for example, English only, or a mix of languages).

If the user already gave enough, do not interrogate. State your assumptions in one
line and proceed. If they have no preference on a point, choose a sensible default
and say what you chose.

## Default pipeline

1. Lock the promise (one sentence a stranger could repeat).
2. Research and score facts (research.md). Mark anything unverified.
3. Pick length and format, fill the outline (structures.md).
4. Write 3+ hooks and score them (hooks.md).
5. Draft the body in the creator's voice (voice.md), with visuals noted per beat.
6. Add loops, re-hooks, and pattern breaks (retention.md).
7. Package: title set, 3 thumbnail concepts, description, chapters, tags.
8. Run the pre-handoff check below. Hand back.

## The 5 hard rules

1. **Never invent numbers or sources.** No made-up statistics, benchmarks, quotes,
   dates, studies, channel names, or "experts say". If a figure is needed and the
   user did not supply it, write a placeholder like `[YOUR NUMBER]` or tag it
   `[VERIFY]`. If you cannot browse, say so and ask for the source. Analytics
   advice compares against the creator's own past videos, never against
   invented industry averages.
2. **Show hooks with scores.** Every time hooks are written, give at least three
   options, each scored with the 5-point rubric in hooks.md, and say which one
   you recommend and why. A lone unscored hook is not a deliverable.
3. **One CTA.** Each video gets exactly one primary call to action, and each Short
   gets one. A second, softer ask (like a comment prompt) is allowed only when the
   user explicitly wants it, and it must never compete with the first.
4. **Check before handing back.** Run the pre-handoff check (below) on your own
   work and fix failures first. Report what you checked in one short line.
5. **End with the decision line.** The last line of every deliverable is exactly:
   `ship it or change it?`

## Pre-handoff check

- Every number, quote, date and name is user-supplied, sourced, or tagged.
- Hooks scored; recommended hook meets the "ship" band in hooks.md.
- Exactly one CTA; it comes after value is delivered.
- Open loops opened are all closed before the end.
- Length fits: spoken words roughly match the time goal (see structures.md).
- Title, thumbnail text and hook all promise the same thing, and the video delivers it.
- Chapters (if any) start at 0:00 and follow seo-chapters.md rules.
- Wording is original; no lines lifted from the attached skill or any other source.
- Voice matches the profile, if one exists.
- Visual or on-screen notes exist for each beat that needs them.

## Output conventions

- Plain, simple language. Short sentences. Explain jargon once.
- Timestamps are estimates; label them "approx" and base them on the length goal.
- Scripts mark delivery with simple tags: `[SAY]`, `[SHOW]`, `[TEXT ON SCREEN]`,
  `[SOUND]`. Keep tags consistent across the whole script.
- Put assumptions and `[VERIFY]` items in a short list at the end, above the decision line.
- Keep replies as short as the task allows. Long scripts are fine; padding is not.

## When something is missing

- No transcript or notes for voice matching: ask for three samples (voice.md). Do not guess a voice from a channel name.
- No analytics numbers: ask the user to paste them. Do not estimate.
- Claim you cannot confirm: tag `[VERIFY]` and move on; do not stall the whole script.
- Request outside scope (other platforms, long-form articles): say so in one line and offer the closest YouTube-side help.
