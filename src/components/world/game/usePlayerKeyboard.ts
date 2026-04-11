"use client";

import { useEffect, useRef } from "react";

type KeyboardState = {
  backward: boolean;
  forward: boolean;
  jump: boolean;
  left: boolean;
  right: boolean;
};

export function usePlayerKeyboard() {
  const keys = useRef<KeyboardState>({
    backward: false,
    forward: false,
    jump: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const updateKey = (pressed: boolean) => (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.current.forward = pressed;
          break;
        case "ArrowDown":
        case "KeyS":
          keys.current.backward = pressed;
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.current.left = pressed;
          break;
        case "ArrowRight":
        case "KeyD":
          keys.current.right = pressed;
          break;
        case "Space":
          keys.current.jump = pressed;
          event.preventDefault();
          break;
      }
    };

    const handleKeyDown = updateKey(true);
    const handleKeyUp = updateKey(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}
