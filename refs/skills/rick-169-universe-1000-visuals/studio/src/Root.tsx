import React from "react";
import { Composition } from "remotion";
import { StyleTestOpening } from "./compositions/StyleTestOpening";
import { CharacterConsistencySheet } from "./compositions/CharacterConsistencySheet";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="StyleTestOpening"
      component={StyleTestOpening}
      durationInFrames={2250}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* QA only: magenta 3D markers must sit inside the cyan 2D crosshairs. */}
    <Composition
      id="StyleTestOpeningDebug"
      component={StyleTestOpening}
      durationInFrames={2250}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ debugProjection: true }}
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
      id="CharacterConsistencySheet"
      component={CharacterConsistencySheet}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
