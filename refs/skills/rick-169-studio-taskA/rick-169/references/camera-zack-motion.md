# Dynamic Camera Grammar (Zack-D-Films 16:9)

- Adapted from `zach-d-films/engine/src/anim.js` into `studio/src/utils/anim.ts`: `clamp`, `lerp`, `smooth`, `easeOut`, `easeIn`, `easeInOut`, `range`, `kfNumber`, `kfVec3`, `cam169`, `place`, `shake`, `slowMoTime`, `mulberry32`.
- **Pacing:** New shot every `2-4 s`. Vary across: `wide_establish`, `two_shot`, `over_shoulder`, `closeup_punch`, `low_angle_power`, `top_down_overview`, `macro_prop_insert`, `whip_pan_cut`, `fly_through_transition`, `impact_slowmo` (cap full shakes <= 4/film), `akira_cutaway`, `infographic_card`.
- **Determinism:** Pure function of `localTimeSec` / `frame` only so 40 parallel GitHub Actions chunks stitch seamlessly.
