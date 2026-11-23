import React from "react";
import { Composition } from "remotion";
import { StyleTestOpening } from "./compositions/StyleTestOpening";
import { MainVideo } from "./compositions/MainVideo";
import { CharacterConsistencySheet } from "./compositions/CharacterConsistencySheet";
import { UniverseShowcase } from "./compositions/UniverseShowcase";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="StyleTestOpening"
      component={StyleTestOpening}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="StyleTestOpeningDebug"
      component={StyleTestOpening}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ debugProjection: true }}
    />
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={5424}
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
    <Composition
      id="UniverseShowcase"
      component={UniverseShowcase}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
