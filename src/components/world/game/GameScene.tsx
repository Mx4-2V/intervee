"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";

import { GamePlayer } from "~/components/world/game/GamePlayer";
import { GroundCollider } from "~/components/world/shared/Ground";
import { SHOW_COORDS } from "~/components/world/shared/scene-constants";
import type { PlayerPosition } from "~/components/world/shared/types";
import { WorldEnvironment } from "~/components/world/shared/WorldEnvironment";
import { PhysicsWorldItems } from "~/components/world/shared/WorldItems";
import { useWorldLayoutData } from "~/hooks/use-world-layout-data";
import { isCompanyPortalItem } from "~/lib/world-layout";

export function GameScene() {
  const router = useRouter();
  const { items } = useWorldLayoutData();
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 0,
  });
  const activatedPortalIdRef = useRef<string | null>(null);

  const camera = useMemo(
    () => ({
      far: 100,
      near: 0.1,
      position: [18, 18, 18] as [number, number, number],
      zoom: 55,
    }),
    [],
  );

  const companyPortals = useMemo(
    () => items.filter(isCompanyPortalItem),
    [items],
  );

  const nearbyPortal = useMemo(() => {
    let closestPortal: (typeof companyPortals)[number] | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const portal of companyPortals) {
      const distance = Math.hypot(
        portal.position[0] - playerPosition.x,
        portal.position[2] - playerPosition.z,
      );

      if (
        distance <= portal.companyPortal.activationRadius + 1.4 &&
        distance < closestDistance
      ) {
        closestPortal = portal;
        closestDistance = distance;
      }
    }

    return closestPortal;
  }, [companyPortals, playerPosition.x, playerPosition.z]);

  useEffect(() => {
    const activePortal = companyPortals.find((portal) => {
      const distance = Math.hypot(
        portal.position[0] - playerPosition.x,
        portal.position[2] - playerPosition.z,
      );

      return distance <= portal.companyPortal.activationRadius;
    });

    if (!activePortal) {
      activatedPortalIdRef.current = null;
      return;
    }

    if (activatedPortalIdRef.current === activePortal.id) {
      return;
    }

    activatedPortalIdRef.current = activePortal.id;
    startTransition(() => {
      router.push(activePortal.companyPortal.companyRoute);
    });
  }, [companyPortals, playerPosition.x, playerPosition.z, router]);

  return (
    <div className="relative h-full w-full">
      {SHOW_COORDS ? (
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md bg-black/55 px-3 py-2 font-mono text-sm text-white">
          {`x: ${playerPosition.x} y: ${playerPosition.y} z: ${playerPosition.z}`}
        </div>
      ) : null}

      {nearbyPortal ? (
        <div className="pointer-events-none absolute top-4 right-4 z-10 max-w-xs rounded-2xl border border-cyan-300/30 bg-slate-950/85 px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <div className="text-[11px] tracking-[0.28em] text-cyan-200 uppercase">
            Portal activo
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {nearbyPortal.companyPortal.companyName}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Entra al circulo para iniciar la entrevista 2D.
          </p>
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
