"use client";

import { GroundVisual } from "~/components/world/shared/Ground";

export function WorldEnvironment({
  editorEnabled,
  onGroundAction,
}: {
  editorEnabled: boolean;
  onGroundAction?: (point: [number, number, number]) => void;
}) {
  const fogRange = editorEnabled ? [120, 220] : [18, 48];

  return (
    <>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", fogRange[0], fogRange[1]]} />

      <ambientLight intensity={1.1} />
      <hemisphereLight intensity={0.55} groundColor="#0b1120" color="#c4d7ff" />
      <directionalLight
        castShadow
        intensity={2.8}
        position={[14, 24, 10]}
        shadow-bias={-0.0002}
        shadow-camera-bottom={editorEnabled ? -60 : -35}
        shadow-camera-far={editorEnabled ? 140 : 80}
        shadow-camera-left={editorEnabled ? -60 : -35}
        shadow-camera-right={editorEnabled ? 60 : 35}
        shadow-camera-top={editorEnabled ? 60 : 35}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <mesh position={[0, 18, -20]}>
        <sphereGeometry args={[8, 40, 40]} />
        <meshBasicMaterial color="#172033" transparent opacity={0.32} />
      </mesh>
      <GroundVisual
        editorEnabled={editorEnabled}
        onGroundAction={onGroundAction}
        showGrid={editorEnabled}
      />
    </>
  );
}
