"use client";

import { Suspense, useRef, useState } from "react";

import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import { Character } from "~/components/world/shared/Character";
import { FollowCameraRig } from "~/components/world/game/FollowCameraRig";
import { usePlayerKeyboard } from "~/components/world/game/usePlayerKeyboard";
import {
  CAMERA_FORWARD,
  CAMERA_RIGHT,
  JUMP_FORCE,
  MOVE_SPEED,
  PLAYER_SPAWN_POSITION,
} from "~/components/world/shared/scene-constants";
import type { PlayerPosition } from "~/components/world/shared/types";

const playerDirection = new THREE.Vector3();

export function GamePlayer({
  onPositionChange,
}: {
  onPositionChange: (position: PlayerPosition) => void;
}) {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<THREE.Group>(null);
  const keys = usePlayerKeyboard();
  const jumpConsumed = useRef(false);
  const lastReportedPosition = useRef<PlayerPosition | null>(null);
  const [animation, setAnimation] = useState<"idle" | "run" | "jump">("idle");

  useFrame((_, delta) => {
    const rigidBody = body.current;
    if (!rigidBody) {
      return;
    }

    const input = keys.current;
    const velocity = rigidBody.linvel();
    const position = rigidBody.translation();
    const grounded = position.y <= 0.05 && Math.abs(velocity.y) < 0.15;

    const nextPosition = {
      x: Number(position.x.toFixed(2)),
      y: Number(position.y.toFixed(2)),
      z: Number(position.z.toFixed(2)),
    };

    if (
      !lastReportedPosition.current ||
      lastReportedPosition.current.x !== nextPosition.x ||
      lastReportedPosition.current.y !== nextPosition.y ||
      lastReportedPosition.current.z !== nextPosition.z
    ) {
      lastReportedPosition.current = nextPosition;
      onPositionChange(nextPosition);
    }

    let horizontal = 0;
    let vertical = 0;

    if (input.forward) {
      vertical += 1;
    }
    if (input.backward) {
      vertical -= 1;
    }
    if (input.left) {
      horizontal -= 1;
    }
    if (input.right) {
      horizontal += 1;
    }

    playerDirection.set(0, 0, 0);

    if (horizontal !== 0 || vertical !== 0) {
      playerDirection
        .addScaledVector(CAMERA_RIGHT, horizontal)
        .addScaledVector(CAMERA_FORWARD, vertical)
        .normalize()
        .multiplyScalar(MOVE_SPEED);
    }

    let nextVerticalVelocity = velocity.y;
    if (input.jump && grounded && !jumpConsumed.current) {
      nextVerticalVelocity = JUMP_FORCE;
      jumpConsumed.current = true;
    }
    if (!input.jump) {
      jumpConsumed.current = false;
    }

    rigidBody.setLinvel(
      {
        x: playerDirection.x,
        y: nextVerticalVelocity,
        z: playerDirection.z,
      },
      true,
    );

    if (visual.current && playerDirection.lengthSq() > 0.001) {
      const targetRotation = Math.atan2(playerDirection.x, playerDirection.z);
      visual.current.rotation.y = THREE.MathUtils.lerp(
        visual.current.rotation.y,
        targetRotation,
        1 - Math.exp(-delta * 12),
      );
    }

    const nextAnimation =
      !grounded || nextVerticalVelocity > 0.2
        ? "jump"
        : playerDirection.lengthSq() > 0.001
          ? "run"
          : "idle";

    setAnimation((current) =>
      current === nextAnimation ? current : nextAnimation,
    );
  });

  return (
    <>
      <FollowCameraRig targetRef={body} />

      <RigidBody
        ref={body}
        colliders={false}
        enabledRotations={[false, false, false]}
        friction={0}
        linearDamping={3}
        position={PLAYER_SPAWN_POSITION}
      >
        <CapsuleCollider args={[0.45, 0.35]} position={[0, 0.8, 0]} />

        <group ref={visual}>
          <Suspense fallback={null}>
            <Character animation={animation} position={[0, 0, 0]} />
          </Suspense>
        </group>
      </RigidBody>
    </>
  );
}
