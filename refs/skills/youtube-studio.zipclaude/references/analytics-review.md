# Analytics review: reading the data, choosing one change

Use when: the user shares numbers or screenshots from YouTube Studio and wants to
know what happened and what to do next.

Hard rules for this file:
- Ask the user to paste the numbers. Never estimate them or recall them.
- Never quote outside benchmarks ("a good CTR is...") unless the user supplies them.
- Compare each video to the creator's own recent videos, not to strangers.
- Small samples prove little. Say when the data is too thin to decide.

## 1. Metrics in plain words

| Metric | What it tells you |
|---|---|
| Impressions | How many times the thumbnail was shown |
| Impressions click-through rate (CTR) | Of those showings, how many became clicks: packaging strength |
| Views | Clicks that turned into watching |
| Average view duration | Typical time watched per view |
| Average percentage viewed | Share of the video watched on average |
| Audience retention graph | Second-by-second share of viewers still watching |
| Traffic sources | Where viewers came from (search, browse, suggested, external, etc.) |
| Returning vs new viewers | Whether the video served your base or reached strangers |
| End-screen clicks | Whether the last-beat bridge worked |

## 2. Reading CTR

- Compare against the channel's own median across recent videos.
- Note when the number was read. Early viewers are often the existing audience; as the video reaches colder audiences the rate often shifts. Look at the trend, not one reading.
- Check CTR with impressions: a high rate on very few impressions is unreliable.
- Look by traffic source if available; browse and search can behave differently.
- If CTR lags, change packaging (titles-thumbnails.md). If CTR is fine but views are low, the problem is reach, not packaging.

## 3. Reading the retention graph

| Shape | Usually means | What to try |
|---|---|---|
| Steep drop in the first seconds | Hook does not match the click, or opens slowly | Rewrite the hook; match the promise (hooks.md) |
| Small early dip then a steady line | Healthy start | Study and repeat what the first minute does |
| Gentle slope the whole way | Normal attrition | Raise density and add breaks (retention.md) |
| Cliff at one moment | Something jarring: topic switch, ad break placement, long setup | Look at the script at that timestamp; add a bridge or cut |
| Sag in the middle | Weak middle | Insert a re-hook; move a strong beat earlier |
| Flat or rising stretch | Rewatch or skipped-back moments; strong content | Make more of that kind of beat; consider a Short from it |
| Drop right before the end | Viewers sense the finish | Land the payoff earlier; keep the CTA short |
| Spikes at specific seconds | People rewind to catch something | Check if it was valuable or confusing |

## 4. Pair CTR and retention

| CTR vs usual | Retention vs usual | Read | Next video |
|---|---|---|---|
| High | High | Packaging and content both work | Make a close relative of this topic and format |
| High | Low | The promise got the click but the video didn't deliver | Fix the hook and body to match; do not tone down the packaging first |
| Low | High | Content is good, packaging hides it | New title/thumbnail concept for this video; apply to future ones |
| Low | Low | Topic or audience mismatch, or a weak all-round idea | Rethink the topic or angle; test a different promise |

"Usual" means the creator's own recent median, which they should provide.

## 5. Review template (one page)

```
Video: ______   Published: ______   Data read on: ______ (days since publish)
Compared against: last [N] videos (user's own)

Numbers (user supplied): Impressions __  CTR __  Views __  Avg view duration __  Avg % viewed __
Traffic sources (top 3): __

Retention graph notes (timestamps of cliffs, sags, spikes):

3 findings (each tied to a number or a graph moment):
1.
2.
3.

1 hypothesis (cause you think explains the biggest finding):

1 change for the next video (see section 6):

How I'll know it worked (the metric and the comparison):
```

## 6. Choosing the change

Change one main thing per video so you can learn from it.

| Finding | Change to test next |
|---|---|
| Early cliff | Hook formula swap; first line shortened |
| Mid sag | Re-hook at the midpoint; strongest beat earlier |
| Low CTR, high retention | Title shape or thumbnail concept |
| Strong end-of-video drop | Payoff before CTA; shorter outro |
| Strong spikes | More demos or examples of that kind |
| Many new viewers, low return | Add a series bridge or a next-video CTA |
| Search traffic low | Keyword phrasing in the title and early spoken lines (seo-chapters.md) |

Rules:
- Write the change as a test with a "how I'll know" line.
- Do not change topic, title style, length, and hook all at once.
- Keep a simple log of changes and results; patterns appear after several videos.

## 7. When data is thin

- A video that is very new or has few impressions: say "too early" and set a time to re-check.
- One odd video is not a trend. Look for the same pattern across several.
- External events (a viral share, a holiday, a news item) can distort numbers; ask the user if one applies.

## Analytics checklist

- [ ] User-supplied numbers only; nothing estimated or invented
- [ ] Compared to the creator's own recent videos
- [ ] CTR and retention read together, not alone
- [ ] Three findings tied to specific data points
- [ ] One hypothesis, one change, one success measure
- [ ] Sample-size caveat stated when relevant
