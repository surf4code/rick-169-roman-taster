import React from "react";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";
import { GradePreset } from "../utils/colorGrade";

export const PostFX: React.FC<{ focusDistance: number; bokehScale: number; grade: GradePreset }> = ({
  focusDistance,
  bokehScale,
  grade,
}) => (
  <EffectComposer multisampling={0}>
    <DepthOfField focusDistance={focusDistance} focalLength={0.025} bokehScale={bokehScale} height={360} />
    <Bloom luminanceThreshold={grade.bloomThreshold} luminanceSmoothing={0.85} intensity={grade.bloomIntensity} mipmapBlur />
    <Vignette eskil={false} offset={0.24} darkness={grade.vignetteDarkness} />
  </EffectComposer>
);
