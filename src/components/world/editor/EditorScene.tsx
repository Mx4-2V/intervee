"use client";

import { useEffect, useMemo } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

import { EditorPanel } from "~/components/world/editor/EditorPanel";
import { useWorldEditor } from "~/components/world/editor/useWorldEditor";
import { SpawnMarker } from "~/components/world/shared/SpawnMarker";
import { WorldEnvironment } from "~/components/world/shared/WorldEnvironment";
import { EditableWorldItems } from "~/components/world/shared/WorldItems";

function EditorCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(40, 40, 40);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

export function EditorScene() {
  const {
    activeAsset,
    deleteSelected,
    duplicateSelected,
    items,
    nudgeRotation,
    persistNow,
    placeAsset,
    saveStatus,
    selectedItem,
    selectedItemId,
    selectAsset,
    selectItem,
    updateSelectedAxis,
  } = useWorldEditor();

  const camera = useMemo(
    () => ({
      far: 260,
      near: 0.1,
      position: [40, 40, 40] as [number, number, number],
      zoom: 28,
    }),
    [],
  );

  return (
    <div className="relative h-full w-full">
      <EditorPanel
        activeAsset={activeAsset}
        onDeleteSelected={deleteSelected}
        onDuplicateSelected={duplicateSelected}
        onNudgeRotation={nudgeRotation}
        onSave={() => void persistNow()}
        onSelectAsset={selectAsset}
        onUpdateSelectedItem={updateSelectedAxis}
        saveStatus={saveStatus}
        selectedItem={selectedItem}
      />

      <Canvas orthographic camera={camera} dpr={[1, 1.5]} shadows>
        <EditorCameraRig />
        <OrbitControls enableRotate={false} makeDefault screenSpacePanning />
        <WorldEnvironment editorEnabled onGroundAction={placeAsset} />
        <SpawnMarker />
        <EditableWorldItems
          items={items}
          onSelectItem={selectItem}
          selectedItemId={selectedItemId}
        />
      </Canvas>
    </div>
  );
}
