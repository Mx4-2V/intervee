"use client";

import { startTransition, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";

// Componentes del mundo
import { GamePlayer } from "~/components/world/game/GamePlayer";
import { GroundCollider } from "~/components/world/shared/Ground";
import { SHOW_COORDS } from "~/components/world/shared/scene-constants";
import type { PlayerPosition } from "~/components/world/shared/types";
import { WorldEnvironment } from "~/components/world/shared/WorldEnvironment";
import { PhysicsWorldItems } from "~/components/world/shared/WorldItems";
import { useWorldLayoutData } from "~/hooks/use-world-layout-data";
import { isCompanyPortalItem } from "~/lib/world-layout";

// Componente de carga que creamos
import WorldLoader from "../WorldLoader"; 

export function GameScene() {
  const router = useRouter();
  const { items } = useWorldLayoutData();
  
  // Estados para posición y transiciones
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isTeleporting, setIsTeleporting] = useState(false);
  const activatedPortalIdRef = useRef<string | null>(null);

  // Configuración de cámara memoizada
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

  // Lógica para detectar el portal más cercano (para la UI)
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

  // Lógica de Teletransporte / Cambio de página
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

    // Iniciamos efecto de teletransporte
    setIsTeleporting(true);

    // Pequeño delay para que el usuario vea la transición antes de cambiar de ruta
    setTimeout(() => {
      startTransition(() => {
        router.push(activePortal.companyPortal.companyRoute);
      });
    }, 600);
  }, [companyPortals, playerPosition.x, playerPosition.z, router]);

  return (
    <div className="relative h-full w-full">
      {/* Pantalla de carga para el teletransporte (Cubre todo) */}
      {isTeleporting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <h1 className="text-3xl font-bold mt-8 animate-pulse">
            Cargando entrevista...
          </h1>
        </div>
      )}

      {/* UI: Coordenadas */}
      {SHOW_COORDS ? (
        <div className="border-intervee-border pointer-events-none absolute top-4 left-4 z-10 border bg-black/65 px-3 py-2 font-mono text-sm text-white shadow-md">
          {`x: ${playerPosition.x.toFixed(2)} y: ${playerPosition.y.toFixed(2)} z: ${playerPosition.z.toFixed(2)}`}
        </div>
      ) : null}

      {/* UI: Aviso de Portal Activo */}
      {nearbyPortal ? (
        <div className="border-intervee-border bg-intervee-surface pointer-events-none absolute top-4 right-4 z-10 max-w-xs border-2 px-4 py-3 text-sm text-white shadow-md animate-in fade-in slide-in-from-right-4">
          <div className="text-intervee-text-soft text-[11px] tracking-[0.28em] uppercase">
            Portal activo
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {nearbyPortal.companyPortal.companyName}
          </div>
          <p className="text-intervee-text-soft mt-1 text-sm">
            Entra al círculo para iniciar la entrevista 2D.
          </p>
        </div>
      ) : null}

      {/* Escena 3D */}
      <Canvas orthographic camera={camera} dpr={[1, 1.5]} shadows>
        <Suspense fallback={<WorldLoader />}>
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