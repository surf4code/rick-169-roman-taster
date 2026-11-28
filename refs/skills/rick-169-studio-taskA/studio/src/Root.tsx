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
    {/* TODO: Replace StyleTestOpening placeholder with dedicated full-length MainVideo composition after Phase 2/3 script & timeline approval. */}
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
