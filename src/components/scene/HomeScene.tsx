"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import {
  CapsuleCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { Canvas, useFrame } from "@react-three/fiber";

import * as THREE from "three";

import { Character } from "~/components/scene/Character";

const CAMERA_OFFSET = new THREE.Vector3(18, 18, 18);
const CAMERA_FORWARD = new THREE.Vector3(-1, 0, -1).normalize();
const CAMERA_RIGHT = new THREE.Vector3(1, 0, -1).normalize();
const CAMERA_TARGET = new THREE.Vector3();
const CAMERA_POSITION = new THREE.Vector3();
const PLAYER_DIRECTION = new THREE.Vector3();

const MOVE_SPEED = 5.5;
const JUMP_FORCE = 8;

type Building = {
  color: string;
  position: [number, number, number];
  size: [number, number, number];
};

const BUILDINGS: Building[] = [
  { color: "#31455f", position: [-9, 2.8, -8], size: [4, 5.6, 4] },
  { color: "#24344d", position: [-9, 1.8, 0], size: [3.5, 3.6, 5] },
  { color: "#3c4f71", position: [-10, 3.4, 9], size: [5, 6.8, 4] },
  { color: "#405574", position: [-1, 2.2, -10], size: [6, 4.4, 3.5] },
  { color: "#2c3a52", position: [0, 4.1, 8], size: [4.5, 8.2, 4.5] },
  { color: "#51627f", position: [9, 2.5, -8], size: [4, 5, 4] },
  { color: "#2a3c56", position: [9, 3.1, 0], size: [5, 6.2, 5] },
  { color: "#394c66", position: [10, 2, 9], size: [4.5, 4, 4] },
];

type KeyboardState = {
  backward: boolean;
  forward: boolean;
  jump: boolean;
  left: boolean;
  right: boolean;
};

function useKeyboardState() {
  const keys = useRef<KeyboardState>({
    backward: false,
    forward: false,
    jump: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const updateKey = (pressed: boolean) => (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.current.forward = pressed;
          break;
        case "ArrowDown":
        case "KeyS":
          keys.current.backward = pressed;
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.current.left = pressed;
          break;
        case "ArrowRight":
        case "KeyD":
          keys.current.right = pressed;
          break;
        case "Space":
          keys.current.jump = pressed;
          event.preventDefault();
          break;
      }
    };

    const handleKeyDown = updateKey(true);
    const handleKeyUp = updateKey(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}

function BuildingCluster() {
  return (
    <>
      {BUILDINGS.map((building) => (
        <RigidBody
          key={building.position.join("-")}
          type="fixed"
          colliders={false}
        >
          <CuboidCollider
            args={[
              building.size[0] / 2,
              building.size[1] / 2,
              building.size[2] / 2,
            ]}
            position={building.position}
          />

          <mesh castShadow position={building.position} receiveShadow>
            <boxGeometry args={building.size} />
            <meshStandardMaterial color={building.color} roughness={0.72} />
          </mesh>

          <mesh
            position={[
              building.position[0],
              building.position[1] + building.size[1] / 2 + 0.05,
              building.position[2],
            ]}
          >
            <boxGeometry
              args={[building.size[0] * 0.92, 0.1, building.size[2] * 0.92]}
            />
            <meshStandardMaterial color="#182230" roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[40, 0.2, 40]} position={[0, -0.2, 0]} />

      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#111827" roughness={0.95} />
      </mesh>

      <gridHelper
        args={[80, 40, "#334155", "#1f2937"]}
        position={[0, 0.01, 0]}
      />
    </RigidBody>
  );
}

function Player() {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<THREE.Group>(null);
  const keys = useKeyboardState();
  const jumpConsumed = useRef(false);
  const [animation, setAnimation] = useState<"idle" | "run" | "jump">("idle");

  useFrame(({ camera }, delta) => {
    const rigidBody = body.current;
    if (!rigidBody) {
      return;
    }

    const input = keys.current;
    const velocity = rigidBody.linvel();
    const position = rigidBody.translation();
    const grounded = position.y <= 0.05 && Math.abs(velocity.y) < 0.15;

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

    PLAYER_DIRECTION.set(0, 0, 0);

    if (horizontal !== 0 || vertical !== 0) {
      PLAYER_DIRECTION.addScaledVector(CAMERA_RIGHT, horizontal)
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
        x: PLAYER_DIRECTION.x,
        y: nextVerticalVelocity,
        z: PLAYER_DIRECTION.z,
      },
      true,
    );

    if (visual.current && PLAYER_DIRECTION.lengthSq() > 0.001) {
      const targetRotation = Math.atan2(PLAYER_DIRECTION.x, PLAYER_DIRECTION.z);
      visual.current.rotation.y = THREE.MathUtils.lerp(
        visual.current.rotation.y,
        targetRotation,
        1 - Math.exp(-delta * 12),
      );
    }

    const nextAnimation =
      !grounded || nextVerticalVelocity > 0.2
        ? "jump"
        : PLAYER_DIRECTION.lengthSq() > 0.001
          ? "run"
          : "idle";

    setAnimation((current) =>
      current === nextAnimation ? current : nextAnimation,
    );

    CAMERA_TARGET.set(position.x, position.y + 1.5, position.z);
    CAMERA_POSITION.copy(CAMERA_TARGET).add(CAMERA_OFFSET);
    camera.position.lerp(CAMERA_POSITION, 1 - Math.exp(-delta * 4));
    camera.lookAt(CAMERA_TARGET);
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      enabledRotations={[false, false, false]}
      friction={0}
      linearDamping={3}
      position={[0, 0, 0]}
    >
      <CapsuleCollider args={[0.45, 0.35]} position={[0, 0.8, 0]} />

      <group ref={visual}>
        <Suspense fallback={null}>
          <Character animation={animation} position={[0, 0, 0]} />
        </Suspense>
      </group>
    </RigidBody>
  );
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 18, 48]} />

      <ambientLight intensity={1.1} />
      <hemisphereLight intensity={0.55} groundColor="#0b1120" color="#c4d7ff" />
      <directionalLight
        castShadow
        intensity={2.8}
        position={[14, 24, 10]}
        shadow-bias={-0.0002}
        shadow-camera-bottom={-35}
        shadow-camera-far={80}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <mesh position={[0, 18, -20]}>
        <sphereGeometry args={[8, 40, 40]} />
        <meshBasicMaterial color="#172033" transparent opacity={0.32} />
      </mesh>

      <Physics gravity={[0, -20, 0]}>
        <Ground />
        <BuildingCluster />
        <Player />
      </Physics>
    </>
  );
}

export function HomeScene() {
  const camera = useMemo(
    () => ({
      far: 100,
      near: 0.1,
      position: [18, 18, 18] as [number, number, number],
      zoom: 55,
    }),
    [],
  );

  return (
    <div className="h-full w-full">
      <Canvas
        orthographic
        camera={camera}
        dpr={[1, 1.5]}
        shadows
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
