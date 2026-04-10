import { create } from "zustand";

interface GameState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useStore = create<GameState>((set) => ({
  count: 0,
  increment: () => set((state: GameState) => ({ count: state.count + 1 })),
  decrement: () => set((state: GameState) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
