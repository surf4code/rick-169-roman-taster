import React from "react";
import { Composition } from "remotion";
import { StyleTestOpening } from "./compositions/StyleTestOpening";
import shotPlan from "./data/styleTestShots.json";
import timedPlan from "./data/shots_timed.json";
import first20 from "./data/first20.json";
import first20Miko from "./data/first20_miko.json";
import first20Miko2 from "./data/first20_miko2.json";
import { SetTest } from "./compositions/SetTest";
import { CharacterConsistencySheet } from "./compositions/CharacterConsistencySheet";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="StyleTestOpening"
      component={StyleTestOpening}
      durationInFrames={shotPlan.meta.total_frames}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* TODO: Placeholder composition (currently points to StyleTestOpening stretched to 37,800 frames).
        Replace with full 21-minute MainVideo composition after Phase 2 script and Phase 3 timeline approval. */}
    <Composition
      id="MainVideo"
      component={StyleTestOpening}
      durationInFrames={37800}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="First20"
      component={StyleTestOpening as any}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ plan: first20 }}
    />
    <Composition
      id="First20Miko"
      component={StyleTestOpening as any}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ plan: first20Miko }}
    />
    <Composition
      id="First20MikoV2"
      component={StyleTestOpening as any}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ plan: first20Miko2 }}
    />
    <Composition
      id="EpisodePreview"
      component={StyleTestOpening as any}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ plan: timedPlan }}
    />
    <Composition
      id="Episode"
      component={StyleTestOpening as any}
      durationInFrames={(timedPlan as any).total_frames}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ plan: timedPlan }}
    />
    <Composition
      id="SetTest"
      component={SetTest as any}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ setId: "banquet_hall_day", camera: "slow_push", t: 0.5 }}
    />
    <Composition
      id="CharacterConsistencySheet"
      component={CharacterConsistencySheet as any}
      defaultProps={{ ids: [] }}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
