"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";

import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type CharacterAnimation = "idle" | "run" | "jump";

type CharacterProps = ThreeElements["group"] & {
  animation?: CharacterAnimation;
};

const MODEL_URL = "/assets/characters/kaykit-large/Mannequin_Large.glb";
const GENERAL_ANIMATIONS_URL =
  "/assets/characters/kaykit-large/Rig_Large_General.glb";
const MOVEMENT_ANIMATIONS_URL =
  "/assets/characters/kaykit-large/Rig_Large_MovementBasic.glb";

type GLTFResult = {
  animations: THREE.AnimationClip[];
  scene: THREE.Group;
};

function cloneMeshMaterials(material: unknown) {
  if (Array.isArray(material)) {
    return material.filter(
      (entry): entry is THREE.Material => entry instanceof THREE.Material,
    );
  }

  return material instanceof THREE.Material ? [material] : [];
}

export function Character({ animation = "idle", ...props }: CharacterProps) {
  const root = useRef<THREE.Group>(null);
  const visual = useRef<THREE.Group>(null);

  const { scene } = useGLTF(MODEL_URL) as GLTFResult;
  const { animations: generalAnimations } = useGLTF(
    GENERAL_ANIMATIONS_URL,
  ) as GLTFResult;
  const { animations: movementAnimations } = useGLTF(
    MOVEMENT_ANIMATIONS_URL,
  ) as GLTFResult;

  const model = useMemo(() => clone(scene), [scene]);
  const clips = useMemo(
    () => [...generalAnimations, ...movementAnimations],
    [generalAnimations, movementAnimations],
  );
  const { actions } = useAnimations(clips, visual);

  const clipMap = useMemo(
    () => ({
      idle:
        clips.find((clip) => clip.name === "Idle_A")?.name ??
        clips.find((clip) => clip.name.toLowerCase().includes("idle"))?.name,
      run:
        clips.find((clip) => clip.name === "Running_A")?.name ??
        clips.find((clip) => clip.name.toLowerCase().includes("run"))?.name,
    }),
    [clips],
  );

  const fit = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);

    const height = size.y || 1;
    const scale = 1.8 / height;
    const groundOffset = -bounds.min.y * scale;

    return { groundOffset, scale };
  }, [model]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = cloneMeshMaterials(child.material);

      if (materials.length > 1) {
        child.material = materials.map((material) => material.clone());
        return;
      }

      const [material] = materials;

      if (material) {
        child.material = material.clone();
      }
    });
  }, [model]);

  useEffect(() => {
    for (const action of Object.values(actions)) {
      action?.fadeOut(0.15);
      action?.stop();
    }

    const clipName = animation === "run" ? clipMap.run : clipMap.idle;
    const action = clipName ? actions[clipName] : undefined;

    if (!action || animation === "jump") {
      return;
    }

    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, animation, clipMap.idle, clipMap.run]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const movementPhase = animation === "run" ? t * 8 : t * 2.2;
    const bob =
      animation === "run"
        ? Math.sin(movementPhase) * 0.035
        : Math.sin(t * 1.6) * 0.008;
    const jumpLift = animation === "jump" ? 0.22 : 0;

    if (root.current) {
      root.current.position.y = bob + jumpLift;
    }

    if (visual.current) {
      visual.current.rotation.z = animation === "jump" ? 0.06 : 0;
      visual.current.rotation.x = animation === "jump" ? -0.18 : 0;
    }
  });

  return (
    <group ref={root} {...props}>
      <group ref={visual}>
        <primitive
          object={model}
          position={[0, fit.groundOffset, 0]}
          rotation={[0, 0, 0]}
          scale={fit.scale}
        />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
useGLTF.preload(GENERAL_ANIMATIONS_URL);
useGLTF.preload(MOVEMENT_ANIMATIONS_URL);
