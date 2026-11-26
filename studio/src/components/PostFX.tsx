import React from "react";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";
import { GradePreset } from "../utils/colorGrade";

/** worldFocus = camera-to-subject distance in world units (keeps the subject sharp, set dressing soft). */
export const PostFX: React.FC<{ focusDistance: number; worldFocus?: number; focusRange?: number; bokehScale: number; grade: GradePreset; blurHeight?: number }> = ({ focusDistance, worldFocus, focusRange, bokehScale, grade, blurHeight = 360 }) => (
  <EffectComposer multisampling={4}>
    <DepthOfField
      focusDistance={focusDistance}
      {...(worldFocus ? ({ worldFocusDistance: worldFocus, worldFocusRange: focusRange ?? Math.max(3.0, worldFocus * 1.3) } as any) : {})}
      focalLength={0.025}
      bokehScale={bokehScale}
      height={blurHeight}
    />
    <Bloom luminanceThreshold={grade.bloomThreshold} luminanceSmoothing={0.85} intensity={grade.bloomIntensity * 1.25} mipmapBlur />
    <Vignette eskil={false} offset={0.24} darkness={grade.vignetteDarkness} />
  </EffectComposer>
);
