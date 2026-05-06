import { EditorScene } from "~/components/world/editor/EditorScene";
import { requireAdminPage } from "~/server/auth/admin";

export default async function EditorPage() {
  await requireAdminPage();

  return (
    <main className="bg-intervee-page h-screen w-screen overflow-hidden text-white">
      <EditorScene />
    </main>
  );
}
