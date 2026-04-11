"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

export function GroundCollider() {
  return (
    <RigidBody colliders={false} type="fixed">
      <CuboidCollider args={[40, 0.2, 40]} position={[0, -0.2, 0]} />
    </RigidBody>
  );
}

export function GroundVisual({
  editorEnabled,
  onGroundAction,
  showGrid = false,
}: {
  editorEnabled: boolean;
  onGroundAction?: (point: [number, number, number]) => void;
  showGrid?: boolean;
}) {
  return (
    <>
      <mesh
        onClick={(event) => {
          if (!editorEnabled || !onGroundAction) {
            return;
          }

          event.stopPropagation();
          onGroundAction([event.point.x, event.point.y, event.point.z]);
        }}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#111827" roughness={0.95} />
      </mesh>

      {showGrid ? (
        <gridHelper
          args={[80, 40, "#334155", "#1f2937"]}
          position={[0, 0.01, 0]}
        />
      ) : null}
    </>
  );
}
