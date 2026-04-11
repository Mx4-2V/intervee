"use client";

import { PLAYER_SPAWN_POSITION } from "~/components/world/shared/scene-constants";

export function SpawnMarker() {
  return (
    <group position={PLAYER_SPAWN_POSITION}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <coneGeometry args={[0.45, 1.2, 16]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#164e63"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>
    </group>
  );
}
