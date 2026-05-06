import { GameScene } from "~/components/world/game/GameScene";

export default function GamePage() {
  return (
    <main className="bg-intervee-surface h-screen w-screen overflow-hidden text-white">
      <GameScene />
    </main>
  );
}
