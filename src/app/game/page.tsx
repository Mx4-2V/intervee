import { GameScene } from "~/components/world/game/GameScene";

export default function GamePage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#050816] text-white">
      <GameScene />
    </main>
  );
}
