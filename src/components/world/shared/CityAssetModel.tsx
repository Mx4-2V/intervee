"use client";

import { useEffect, useMemo } from "react";

import { useGLTF } from "@react-three/drei";

import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  getWorldAssetDefinition,
  WORLD_ASSET_DEFINITIONS,
} from "~/lib/world-layout";

type GLTFScene = {
  scene: THREE.Group;
};

function cloneMeshMaterials(material: unknown) {
  if (Array.isArray(material)) {
    return material.filter(
      (entry): entry is THREE.Material => entry instanceof THREE.Material,
    );
  }

  return material instanceof THREE.Material ? [material] : [];
}

export function CityAssetModel({ asset }: { asset: string }) {
  const definition = getWorldAssetDefinition(asset);
  const { scene } = useGLTF(`/assets/city-glb/${asset}.glb`) as GLTFScene;
  const model = useMemo(() => clone(scene), [scene]);

  const fit = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const modelSize = new THREE.Vector3();
    bounds.getSize(modelSize);

    const width = modelSize.x || 1;
    const height = modelSize.y || 1;
    const depth = modelSize.z || 1;
    const scale =
      definition?.fitMode === "xz"
        ? Math.min(definition.size[0] / width, definition.size[2] / depth)
        : Math.min(
            definition?.size[0] ? definition.size[0] / width : 1,
            definition?.size[1] ? definition.size[1] / height : 1,
            definition?.size[2] ? definition.size[2] / depth : 1,
          );

    return {
      groundOffset: -bounds.min.y * scale,
      scale,
    };
  }, [definition, model]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = cloneMeshMaterials(child.material);

      if (materials.length > 1) {
        child.material = materials.map((material) => material.clone());
        return;
      }

      const [material] = materials;
      if (material) {
        child.material = material.clone();
      }
    });
  }, [model]);

  return (
    <primitive
      object={model}
      position={[0, fit.groundOffset, 0]}
      scale={fit.scale}
    />
  );
}

for (const asset of Object.keys(WORLD_ASSET_DEFINITIONS)) {
  if (!WORLD_ASSET_DEFINITIONS[asset]?.procedural) {
    useGLTF.preload(`/assets/city-glb/${asset}.glb`);
  }
}
