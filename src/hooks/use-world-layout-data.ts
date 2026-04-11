"use client";

import { useEffect, useState } from "react";

import fallbackWorldLayout from "~/data/world-layout.json";
import type { WorldItem, WorldLayout } from "~/lib/world-layout";

export function useWorldLayoutData() {
  const [items, setItems] = useState<WorldItem[]>(
    fallbackWorldLayout.items as WorldItem[],
  );
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLayout = async () => {
      try {
        const response = await fetch("/api/world-layout", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to load world layout");
        }

        const data = (await response.json()) as WorldLayout;
        if (!cancelled) {
          setItems(data.items);
        }
      } catch {
        // Keep the bundled fallback when the API is unavailable.
      } finally {
        if (!cancelled) {
          setLayoutLoaded(true);
        }
      }
    };

    void loadLayout();

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, layoutLoaded, setItems };
}
