"use client";

import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

import * as THREE from "three";

import { CAMERA_OFFSET } from "~/components/world/shared/scene-constants";

const cameraTarget = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();

export function FollowCameraRig({
  targetRef,
}: {
  targetRef: React.MutableRefObject<RapierRigidBody | null>;
}) {
  useFrame(({ camera }, delta) => {
    const rigidBody = targetRef.current;
    if (!rigidBody) {
      return;
    }

    const position = rigidBody.translation();
    cameraTarget.set(position.x, position.y + 1.5, position.z);
    cameraPosition.copy(cameraTarget).add(CAMERA_OFFSET);
    camera.position.lerp(cameraPosition, 1 - Math.exp(-delta * 4));
    camera.lookAt(cameraTarget);
  });

  return null;
}
