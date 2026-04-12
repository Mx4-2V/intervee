"use client";

import { useMemo } from "react";

import { useTexture } from "@react-three/drei";

import * as THREE from "three";

import { BILLBOARD_IMAGE_OPTIONS } from "~/lib/world-layout";

const DEFAULT_IMAGE = BILLBOARD_IMAGE_OPTIONS[0];

export function Billboard16x9({ imageUrl }: { imageUrl?: string }) {
  const texture = useTexture(imageUrl ?? DEFAULT_IMAGE);

  const materials = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    return {
      frame: new THREE.MeshStandardMaterial({
        color: "#111827",
        metalness: 0.25,
        roughness: 0.7,
      }),
      panel: new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color("#1f2937"),
        emissiveIntensity: 0.18,
        roughness: 0.65,
      }),
      support: new THREE.MeshStandardMaterial({
        color: "#1f2937",
        metalness: 0.1,
        roughness: 0.8,
      }),
    };
  }, [texture]);

  return (
    <group>
      <mesh castShadow position={[-2.1, 1.75, 0]} receiveShadow>
        <boxGeometry args={[0.28, 3.5, 0.28]} />
        <primitive attach="material" object={materials.support} />
      </mesh>

      <mesh castShadow position={[2.1, 1.75, 0]} receiveShadow>
        <boxGeometry args={[0.28, 3.5, 0.28]} />
        <primitive attach="material" object={materials.support} />
      </mesh>

      <mesh castShadow position={[0, 4.1, 0]} receiveShadow>
        <boxGeometry args={[6.9, 3.95, 0.25]} />
        <primitive attach="material" object={materials.frame} />
      </mesh>

      <mesh castShadow position={[0, 4.1, 0.16]} receiveShadow>
        <planeGeometry args={[6.4, 3.6]} />
        <primitive attach="material" object={materials.panel} />
      </mesh>
    </group>
  );
}
