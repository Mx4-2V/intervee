"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  GRID_SIZE,
  snapValue,
} from "~/components/world/shared/scene-constants";
import type { SaveStatus } from "~/components/world/shared/types";
import {
  BILLBOARD_IMAGE_OPTIONS,
  getWorldAssetDefinition,
  type WorldItem,
  type WorldLayout,
} from "~/lib/world-layout";
import { useWorldLayoutData } from "~/hooks/use-world-layout-data";

export function useWorldEditor() {
  const { items, layoutLoaded, setItems } = useWorldLayoutData();
  const [activeAsset, setActiveAsset] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const hasInitializedPersistence = useRef(false);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  const persistLayout = useCallback(async (nextItems: WorldItem[]) => {
    setSaveStatus("saving");

    try {
      const response = await fetch("/api/world-layout", {
        body: JSON.stringify({ items: nextItems } satisfies WorldLayout),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      setSaveStatus(response.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!layoutLoaded) {
      return;
    }

    if (!hasInitializedPersistence.current) {
      hasInitializedPersistence.current = true;
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void persistLayout(items);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [items, layoutLoaded, persistLayout]);

  const placeAsset = useCallback(
    (point: [number, number, number]) => {
      if (!activeAsset) {
        setSelectedItemId(null);
        return;
      }

      const definition = getWorldAssetDefinition(activeAsset);
      if (!definition) {
        return;
      }

      const item: WorldItem = {
        asset: activeAsset,
        id: crypto.randomUUID(),
        imageUrl:
          activeAsset === "billboard_16_9"
            ? BILLBOARD_IMAGE_OPTIONS[0]
            : undefined,
        position: [
          snapValue(point[0]),
          definition.defaultY ?? 0,
          snapValue(point[2]),
        ],
        rotationY: 0,
      };

      setItems((current) => [...current, item]);
      setSelectedItemId(item.id);
    },
    [activeAsset, setItems],
  );

  const updateSelectedItem = useCallback(
    (updater: (item: WorldItem) => WorldItem) => {
      if (!selectedItemId) {
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === selectedItemId ? updater(item) : item,
        ),
      );
    },
    [selectedItemId, setItems],
  );

  const updateSelectedAxis = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      if (!Number.isFinite(value)) {
        return;
      }

      updateSelectedItem((item) => {
        const nextPosition: [number, number, number] = [...item.position] as [
          number,
          number,
          number,
        ];

        if (axis === "x") nextPosition[0] = value;
        if (axis === "y") nextPosition[1] = value;
        if (axis === "z") nextPosition[2] = value;

        return {
          ...item,
          position: nextPosition,
        };
      });
    },
    [updateSelectedItem],
  );

  useEffect(() => {
    const isFormFieldFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLButtonElement ||
        activeElement?.getAttribute("contenteditable") === "true"
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedItem || isFormFieldFocused()) {
        return;
      }

      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          updateSelectedAxis(
            "x",
            snapValue(selectedItem.position[0] - GRID_SIZE),
          );
          break;
        case "ArrowRight":
          event.preventDefault();
          updateSelectedAxis(
            "x",
            snapValue(selectedItem.position[0] + GRID_SIZE),
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          updateSelectedAxis(
            "z",
            snapValue(selectedItem.position[2] - GRID_SIZE),
          );
          break;
        case "ArrowDown":
          event.preventDefault();
          updateSelectedAxis(
            "z",
            snapValue(selectedItem.position[2] + GRID_SIZE),
          );
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, updateSelectedAxis]);

  const duplicateSelected = useCallback(() => {
    if (!selectedItem) {
      return;
    }

    const duplicate: WorldItem = {
      ...selectedItem,
      id: crypto.randomUUID(),
      position: [
        selectedItem.position[0] + 1,
        selectedItem.position[1],
        selectedItem.position[2] + 1,
      ],
    };

    setItems((current) => [...current, duplicate]);
    setSelectedItemId(duplicate.id);
  }, [selectedItem, setItems]);

  const deleteSelected = useCallback(() => {
    if (!selectedItemId) {
      return;
    }

    setItems((current) => current.filter((item) => item.id !== selectedItemId));
    setSelectedItemId(null);
  }, [selectedItemId, setItems]);

  const nudgeRotation = useCallback(
    (delta: number) => {
      updateSelectedItem((item) => ({
        ...item,
        rotationY: (item.rotationY ?? 0) + delta,
      }));
    },
    [updateSelectedItem],
  );

  const updateSelectedImageUrl = useCallback(
    (imageUrl: string) => {
      updateSelectedItem((item) => ({
        ...item,
        imageUrl,
      }));
    },
    [updateSelectedItem],
  );

  return {
    activeAsset,
    items,
    layoutLoaded,
    persistNow: () => persistLayout(items),
    placeAsset,
    saveStatus,
    selectedItem,
    selectedItemId,
    selectAsset: setActiveAsset,
    selectItem: setSelectedItemId,
    deleteSelected,
    duplicateSelected,
    nudgeRotation,
    updateSelectedImageUrl,
    updateSelectedAxis,
  };
}
