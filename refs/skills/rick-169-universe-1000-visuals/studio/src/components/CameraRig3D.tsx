import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { CAM_FAR, CAM_NEAR, Cam, upFromRoll } from "../utils/camera";

// Applies a pure Cam to the R3F camera. Must stay in sync with utils/camera.ts.
export const CameraRig3D: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  const up = upFromRoll(cam.roll);
  pc.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
  pc.up.set(up[0], up[1], up[2]);
  pc.lookAt(cam.look[0], cam.look[1], cam.look[2]);
  pc.fov = cam.fov;
  pc.near = CAM_NEAR;
  pc.far = CAM_FAR;
  pc.updateProjectionMatrix();
  pc.updateMatrixWorld();
  return null;
};
