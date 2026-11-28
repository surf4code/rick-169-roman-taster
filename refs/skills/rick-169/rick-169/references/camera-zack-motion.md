# Dynamic Camera Grammar (Zack-D-Films Energy on Ricks-Clips Smoothness)

Source: `claude-animation-skills/skills/zach-d-films/engine/src/anim.js`, adapted to 16:9 (`1920x1080`) in `src/utils/anim.ts`.

## 1. Included Helpers (`src/utils/anim.ts`)

- `clamp`, `lerp`, `smooth`, `easeOut`, `easeIn`, `easeInOut`, `range`
- `kfNumber(t, keys, ease)` and `kfVec3(t, keys, ease)`
- `cam169(fov)` (`aspect = 1920 / 1080`), `place(camera, pos, look, roll)`
- `shake(t, amp, seed)` (deterministic layered sine handheld drift/impact)
- `slowMoTime(t, impactStart, impactEnd, slowFactor)` (pure-function slow-motion remapper)

## 2. Pacing & Shot Variety (New Shot Every 2-4 Seconds)

Rotate across: `wide_establish`, `two_shot`, `over_shoulder`, `closeup_punch` (ease-out on emphasis words), `low_angle_power`, `top_down_overview`, `macro_prop_insert`, `whip_pan_cut`, `fly_through_transition` (time/place jumps), `impact_slowmo` (cap full shakes at <= 4 per 20-min film), `akira_cutaway`, and `infographic_card`.

## 3. Pure-Function Rule

Every shot `update(localTimeSec)` depends ONLY on `localTimeSec` so parallel GitHub Actions render chunks stitch with zero frame seam discontinuities.
