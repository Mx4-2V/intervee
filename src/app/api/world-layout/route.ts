import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { worldLayoutSchema } from "~/lib/world-layout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const worldLayoutPath = join(process.cwd(), "src", "data", "world-layout.json");

async function readWorldLayout() {
  const file = await readFile(worldLayoutPath, "utf8");
  return worldLayoutSchema.parse(JSON.parse(file));
}

export async function GET() {
  const layout = await readWorldLayout();
  return Response.json(layout);
}

export async function POST(request: Request) {
  const payload = worldLayoutSchema.parse(await request.json());
  await writeFile(
    worldLayoutPath,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
  return Response.json({ ok: true });
}
