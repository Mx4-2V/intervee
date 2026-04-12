"use client";

import { useMemo, useRef } from "react";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

const DEFAULT_THEME_COLOR = "#7dd3fc";

export function CompanyPortal({
  activationRadius,
  logoUrl,
  themeColor,
}: {
  activationRadius: number;
  logoUrl: string;
  themeColor?: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(logoUrl);

  const materials = useMemo(() => {
    const accent = new THREE.Color(themeColor ?? DEFAULT_THEME_COLOR);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    return {
      beam: new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.2,
        metalness: 0.05,
        opacity: 0.15,
        roughness: 0.35,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      disk: new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.3,
        metalness: 0.08,
        opacity: 0.18,
        roughness: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      logo: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffffff"),
        depthWrite: false,
        emissive: accent,
        emissiveIntensity: 0.12,
        map: texture,
        opacity: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        roughness: 0.95,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      logoGlow: new THREE.MeshBasicMaterial({
        alphaMap: texture,
        color: accent.clone().lerp(new THREE.Color("#ffffff"), 0.55),
        depthWrite: false,
        opacity: 0.26,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      logoUnderGlow: new THREE.MeshBasicMaterial({
        color: accent.clone().lerp(new THREE.Color("#ffffff"), 0.2),
        depthWrite: false,
        opacity: 0.14,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      ring: new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 1,
        metalness: 0.12,
        opacity: 0.82,
        roughness: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    };
  }, [texture, themeColor]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const pulse = 0.98 + Math.sin(elapsed * 2.4) * 0.04;

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.35;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh position={[0, 0.025, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[activationRadius * 0.72, 64]} />
        <primitive attach="material" object={materials.disk} />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[activationRadius * 0.82, activationRadius, 64]} />
        <primitive attach="material" object={materials.ring} />
      </mesh>

      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry
          args={[
            activationRadius * 0.68,
            activationRadius * 0.82,
            2.6,
            48,
            1,
            true,
          ]}
        />
        <primitive attach="material" object={materials.beam} />
      </mesh>

      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[activationRadius * 0.56, 48]} />
        <primitive attach="material" object={materials.logoUnderGlow} />
      </mesh>

      <mesh position={[0, 0.031, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry
          args={[activationRadius * 1.1, activationRadius * 1.1]}
        />
        <primitive attach="material" object={materials.logo} />
      </mesh>

      <mesh position={[0, 0.032, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry
          args={[activationRadius * 1.1, activationRadius * 1.1]}
        />
        <primitive attach="material" object={materials.logoGlow} />
      </mesh>
    </group>
  );
}
