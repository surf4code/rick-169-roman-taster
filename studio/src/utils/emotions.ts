export type EmotionName =
  | "neutral" | "curious" | "talking_animated" | "shocked"
  | "skeptical" | "happy_relief" | "nervous_sweat" | "focused_reading"
  | "confident_point" | "embarrassed_blush" | "sad_slump" | "angry_glare"
  | "thinking_chin" | "surprised_jump" | "shrug_question" | "celebrate_arms_up"
  | "palms_out" | "present_palm" | "scrub" | "cradle_calm" | "wash_face";

export interface EmotionPose {
  headTiltDeg: number;
  torsoLeanDeg: number;
  browLeftDeg: number;
  browRightDeg: number;
  eyeScaleY: number;
  pupilOffsetX: number;
  armLeftDeg: number;
  armRightDeg: number;
  forearmRightDeg: number;
  showSweatDrop?: boolean;
  showBlush?: boolean;
  showShockLines?: boolean;
}

export const EMOTION_LIBRARY: Record<EmotionName, EmotionPose> = {
  neutral: { headTiltDeg: 0, torsoLeanDeg: 0, browLeftDeg: 0, browRightDeg: 0, eyeScaleY: 1, pupilOffsetX: 0, armLeftDeg: 14, armRightDeg: -14, forearmRightDeg: -10 },
  curious: { headTiltDeg: 8, torsoLeanDeg: 4, browLeftDeg: -10, browRightDeg: 6, eyeScaleY: 1.08, pupilOffsetX: 2, armLeftDeg: 15, armRightDeg: -28, forearmRightDeg: -45 },
  talking_animated: { headTiltDeg: -4, torsoLeanDeg: 3, browLeftDeg: -6, browRightDeg: -6, eyeScaleY: 1.0, pupilOffsetX: 0, armLeftDeg: 28, armRightDeg: -52, forearmRightDeg: -35 },
  shocked: { headTiltDeg: -7, torsoLeanDeg: -8, browLeftDeg: -18, browRightDeg: -18, eyeScaleY: 1.32, pupilOffsetX: 0, armLeftDeg: 65, armRightDeg: -65, forearmRightDeg: -25, showShockLines: true },
  skeptical: { headTiltDeg: -5, torsoLeanDeg: -3, browLeftDeg: 14, browRightDeg: -12, eyeScaleY: 0.78, pupilOffsetX: 3, armLeftDeg: 8, armRightDeg: -22, forearmRightDeg: -70 },
  happy_relief: { headTiltDeg: 5, torsoLeanDeg: 2, browLeftDeg: -8, browRightDeg: -8, eyeScaleY: 0.88, pupilOffsetX: 0, armLeftDeg: 20, armRightDeg: -20, forearmRightDeg: -15, showBlush: true },
  nervous_sweat: { headTiltDeg: 6, torsoLeanDeg: -5, browLeftDeg: -15, browRightDeg: 15, eyeScaleY: 1.12, pupilOffsetX: -3, armLeftDeg: 18, armRightDeg: -18, forearmRightDeg: -55, showSweatDrop: true },
  focused_reading: { headTiltDeg: 10, torsoLeanDeg: 6, browLeftDeg: 8, browRightDeg: 8, eyeScaleY: 0.92, pupilOffsetX: 2, armLeftDeg: 22, armRightDeg: -48, forearmRightDeg: -60 },
  confident_point: { headTiltDeg: -3, torsoLeanDeg: 4, browLeftDeg: -5, browRightDeg: -5, eyeScaleY: 1.05, pupilOffsetX: 2, armLeftDeg: 15, armRightDeg: -95, forearmRightDeg: -5 },
  embarrassed_blush: { headTiltDeg: 12, torsoLeanDeg: -4, browLeftDeg: -14, browRightDeg: 14, eyeScaleY: 0.85, pupilOffsetX: -4, armLeftDeg: 10, armRightDeg: -30, forearmRightDeg: -80, showBlush: true },
  sad_slump: { headTiltDeg: 16, torsoLeanDeg: 10, browLeftDeg: -16, browRightDeg: 16, eyeScaleY: 0.72, pupilOffsetX: 0, armLeftDeg: 6, armRightDeg: -6, forearmRightDeg: -5 },
  angry_glare: { headTiltDeg: -6, torsoLeanDeg: 7, browLeftDeg: 18, browRightDeg: -18, eyeScaleY: 0.82, pupilOffsetX: 0, armLeftDeg: 35, armRightDeg: -35, forearmRightDeg: -40 },
  thinking_chin: { headTiltDeg: 9, torsoLeanDeg: 2, browLeftDeg: 10, browRightDeg: -10, eyeScaleY: 0.95, pupilOffsetX: -2, armLeftDeg: 12, armRightDeg: -42, forearmRightDeg: -95 },
  surprised_jump: { headTiltDeg: -10, torsoLeanDeg: -10, browLeftDeg: -20, browRightDeg: -20, eyeScaleY: 1.35, pupilOffsetX: 0, armLeftDeg: 85, armRightDeg: -85, forearmRightDeg: -15, showShockLines: true },
  shrug_question: { headTiltDeg: 7, torsoLeanDeg: 0, browLeftDeg: -12, browRightDeg: -12, eyeScaleY: 1.05, pupilOffsetX: 0, armLeftDeg: 48, armRightDeg: -48, forearmRightDeg: -65 },
  palms_out: { headTiltDeg: -4, torsoLeanDeg: -2, browLeftDeg: -10, browRightDeg: -10, eyeScaleY: 1.05, pupilOffsetX: 0, armLeftDeg: 40, armRightDeg: -40, forearmRightDeg: -40 },
  present_palm: { headTiltDeg: -3, torsoLeanDeg: 1, browLeftDeg: 4, browRightDeg: 4, eyeScaleY: 0.92, pupilOffsetX: 0, armLeftDeg: 14, armRightDeg: -60, forearmRightDeg: -30 },
  scrub: { headTiltDeg: 10, torsoLeanDeg: 14, browLeftDeg: -12, browRightDeg: 12, eyeScaleY: 0.8, pupilOffsetX: 0, armLeftDeg: 20, armRightDeg: -20, forearmRightDeg: -10 },
  cradle_calm: { headTiltDeg: 8, torsoLeanDeg: 2, browLeftDeg: -8, browRightDeg: -8, eyeScaleY: 0.82, pupilOffsetX: 0, armLeftDeg: 20, armRightDeg: -20, forearmRightDeg: -15, showBlush: true },
  wash_face: { headTiltDeg: 6, torsoLeanDeg: 8, browLeftDeg: 0, browRightDeg: 0, eyeScaleY: 0.4, pupilOffsetX: 0, armLeftDeg: 30, armRightDeg: -30, forearmRightDeg: -90 },
  celebrate_arms_up: { headTiltDeg: -8, torsoLeanDeg: -4, browLeftDeg: -10, browRightDeg: -10, eyeScaleY: 1.1, pupilOffsetX: 0, armLeftDeg: 135, armRightDeg: -135, forearmRightDeg: -10 },
};
