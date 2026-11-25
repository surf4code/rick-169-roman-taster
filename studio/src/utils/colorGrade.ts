export interface GradePreset {
  name: string;
  targetLumMin: number;
  targetLumMax: number;
  targetSatMin: number;
  targetSatMax: number;
  keyLightColor: string;
  keyLightIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  rimLightColor: string;
  rimLightIntensity: number;
  ambientIntensity: number;
  vignetteDarkness: number;
  bloomThreshold: number;
  bloomIntensity: number;
  bgColor: string;
}

export const RICK_WARM_BRIGHT_DAY: GradePreset = {
  name: "rick_warm_bright_day",
  targetLumMin: 0.45,
  targetLumMax: 0.55,
  targetSatMin: 0.40,
  targetSatMax: 0.65,
  keyLightColor: "#FFF1D6",
  keyLightIntensity: 1.85,
  hemiSkyColor: "#DCE8FF",
  hemiGroundColor: "#8A7A6E",
  hemiIntensity: 0.72,
  rimLightColor: "#FFE6B3",
  rimLightIntensity: 0.95,
  ambientIntensity: 0.52,
  vignetteDarkness: 0.10,
  bloomThreshold: 0.90,
  bloomIntensity: 0.45,
  bgColor: "#E8DFC8",
};

export const RICK_WARM_TORCH_NIGHT: GradePreset = {
  name: "rick_warm_torch_night",
  targetLumMin: 0.36,
  targetLumMax: 0.48,
  targetSatMin: 0.42,
  targetSatMax: 0.65,
  keyLightColor: "#FFAE52",
  keyLightIntensity: 2.05,
  hemiSkyColor: "#5C6FA6",
  hemiGroundColor: "#6B4E3B",
  hemiIntensity: 0.62,
  rimLightColor: "#FFD28E",
  rimLightIntensity: 1.05,
  ambientIntensity: 0.40,
  vignetteDarkness: 0.12,
  bloomThreshold: 0.86,
  bloomIntensity: 0.58,
  bgColor: "#485175",
};
