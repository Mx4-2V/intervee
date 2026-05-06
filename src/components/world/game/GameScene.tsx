"use client";

import { startTransition, useEffect, useMemo, useRef, useState, Suspense } from "react";
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

import LoadingScreen from "../../LoadingScreen";
import { PanelCard } from "../../ui";
import { SectionLabel } from "../../ui";

const MIN_LOAD_MS = 2500;

export function GameScene() {
  const router = useRouter();
  const { items } = useWorldLayoutData();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MIN_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isTeleporting, setIsTeleporting] = useState(false);
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

    setIsTeleporting(true);

    setTimeout(() => {
      startTransition(() => {
        router.push(activePortal.companyPortal.companyRoute);
      });
    }, 600);
  }, [companyPortals, playerPosition.x, playerPosition.z, router]);

  return (
    <div className="relative h-full w-full">
      {!ready && <LoadingScreen title="Cargando Entorno 3D..." />}

      {isTeleporting && (
        <LoadingScreen title="Cargando entrevista..." />
      )}

      {ready && SHOW_COORDS ? (
        <div className="border-intervee-border pointer-events-none absolute top-4 left-4 z-10 border bg-black/65 px-3 py-2 font-mono text-sm text-white shadow-md">
          {`x: ${playerPosition.x.toFixed(2)} y: ${playerPosition.y.toFixed(2)} z: ${playerPosition.z.toFixed(2)}`}
        </div>
      ) : null}

      {ready && nearbyPortal ? (
        <PanelCard className="pointer-events-none absolute top-4 right-4 z-10 max-w-xs animate-in fade-in slide-in slide-in-from-right-4" padding="sm">
          <SectionLabel size="xs" tracking="wide">Portal activo</SectionLabel>
          <div className="mt-1 text-lg font-semibold text-white">
            {nearbyPortal.companyPortal.companyName}
          </div>
          <p className="text-intervee-text-soft mt-1 text-sm">
            Entra al círculo para iniciar la entrevista 2D.
          </p>
        </PanelCard>
      ) : null}

      <Canvas orthographic camera={camera} dpr={[1, 1.5]} shadows>
        <Suspense fallback={null}>
          <WorldEnvironment editorEnabled={false} />
          <Physics gravity={[0, -20, 0]}>
            <GroundCollider />
            <PhysicsWorldItems items={items} />
            <GamePlayer onPositionChange={setPlayerPosition} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
