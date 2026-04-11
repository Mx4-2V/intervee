import { EditorScene } from "~/components/world/editor/EditorScene";

export default function EditorPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#050816] text-white">
      <EditorScene />
    </main>
  );
}
