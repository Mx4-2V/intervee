"use client";

import { Suspense } from "react";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { Billboard16x9 } from "~/components/world/shared/Billboard16x9";
import { CityAssetModel } from "~/components/world/shared/CityAssetModel";
import { getWorldAssetDefinition, type WorldItem } from "~/lib/world-layout";

function AssetSelectionMarker({ asset }: { asset: string }) {
  const definition = getWorldAssetDefinition(asset);
  if (!definition) {
    return null;
  }

  return (
    <mesh position={[0, definition.size[1] / 2, 0]}>
      <boxGeometry args={definition.size} />
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} wireframe />
    </mesh>
  );
}

function AssetContent({
  item,
  selected,
}: {
  item: WorldItem;
  selected: boolean;
}) {
  const definition = getWorldAssetDefinition(item.asset);

  return (
    <>
      {definition?.procedural ? (
        <Billboard16x9 imageUrl={item.imageUrl} />
      ) : (
        <CityAssetModel asset={item.asset} />
      )}
      {selected ? <AssetSelectionMarker asset={item.asset} /> : null}
    </>
  );
}

export function PhysicsWorldItems({ items }: { items: WorldItem[] }) {
  return (
    <>
      {items.map((item) => {
        const definition = getWorldAssetDefinition(item.asset);
        if (!definition) {
          return null;
        }

        if (definition.solid) {
          return (
            <RigidBody
              key={item.id}
              colliders={false}
              position={item.position}
              rotation={[0, item.rotationY ?? 0, 0]}
              type="fixed"
            >
              <CuboidCollider
                args={[
                  definition.size[0] / 2,
                  definition.size[1] / 2,
                  definition.size[2] / 2,
                ]}
                position={[0, definition.size[1] / 2, 0]}
              />

              <Suspense fallback={null}>
                <AssetContent item={item} selected={false} />
              </Suspense>
            </RigidBody>
          );
        }

        return (
          <group
            key={item.id}
            position={item.position}
            rotation={[0, item.rotationY ?? 0, 0]}
          >
            <Suspense fallback={null}>
              <AssetContent item={item} selected={false} />
            </Suspense>
          </group>
        );
      })}
    </>
  );
}

export function EditableWorldItems({
  items,
  onSelectItem,
  selectedItemId,
}: {
  items: WorldItem[];
  onSelectItem: (itemId: string) => void;
  selectedItemId: string | null;
}) {
  return (
    <>
      {items.map((item) => (
        <group
          key={item.id}
          onClick={(event) => {
            event.stopPropagation();
            onSelectItem(item.id);
          }}
          position={item.position}
          rotation={[0, item.rotationY ?? 0, 0]}
        >
          <Suspense fallback={null}>
            <AssetContent item={item} selected={selectedItemId === item.id} />
          </Suspense>
        </group>
      ))}
    </>
  );
}
