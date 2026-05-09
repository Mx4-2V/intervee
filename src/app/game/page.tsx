import { GameScene } from "~/components/world/game/GameScene";
import { requireUserPage } from "~/server/auth/admin";

export default async function GamePage() {
  await requireUserPage("/game");

  return (
    <main className="bg-intervee-surface h-screen w-screen overflow-hidden text-white">
      <GameScene />
    </main>
  );
}
