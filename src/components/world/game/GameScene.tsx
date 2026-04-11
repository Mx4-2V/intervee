"use client";

import { useMemo, useState } from "react";

import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";

import { GamePlayer } from "~/components/world/game/GamePlayer";
import { GroundCollider } from "~/components/world/shared/Ground";
import { SHOW_COORDS } from "~/components/world/shared/scene-constants";
import type { PlayerPosition } from "~/components/world/shared/types";
import { WorldEnvironment } from "~/components/world/shared/WorldEnvironment";
import { PhysicsWorldItems } from "~/components/world/shared/WorldItems";
import { useWorldLayoutData } from "~/hooks/use-world-layout-data";

export function GameScene() {
  const { items } = useWorldLayoutData();
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 0,
  });

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
    <div className="relative h-full w-full">
      {SHOW_COORDS ? (
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md bg-black/55 px-3 py-2 font-mono text-sm text-white">
          {`x: ${playerPosition.x} y: ${playerPosition.y} z: ${playerPosition.z}`}
        </div>
      ) : null}

      <Canvas orthographic camera={camera} dpr={[1, 1.5]} shadows>
        <WorldEnvironment editorEnabled={false} />
        <Physics gravity={[0, -20, 0]}>
          <GroundCollider />
          <PhysicsWorldItems items={items} />
          <GamePlayer onPositionChange={setPlayerPosition} />
        </Physics>
      </Canvas>
    </div>
  );
}
