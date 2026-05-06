import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { isCompanyPortalItem, worldLayoutSchema, type WorldItem } from "~/lib/world-layout";
import { requireAdminApi } from "~/server/auth/admin";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const worldLayoutPath = join(process.cwd(), "src", "data", "world-layout.json");

async function readWorldLayout() {
  const file = await readFile(worldLayoutPath, "utf8");
  return worldLayoutSchema.parse(JSON.parse(file));
}

async function getDatabaseCompanyPortals(): Promise<WorldItem[]> {
  const portals = await db.companyPortal.findMany({
    where: { company: { isActive: true }, isActive: true },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });

  return portals.map((portal) => ({
    asset: "company_portal",
    companyPortal: {
      activationRadius: portal.activationRadius,
      companyName: portal.company.name,
      companyRoute: `/companies/${portal.company.slug}/interview`,
      companySlug: portal.company.slug,
      documentKey: portal.company.slug,
      logoUrl: portal.logoUrl ?? portal.company.logoUrl ?? "/assets/logos/microsoft.png",
      themeColor: portal.themeColor ?? portal.company.themeColor ?? undefined,
    },
    id: portal.id,
    position: [portal.positionX, portal.positionY, portal.positionZ],
    rotationY: portal.rotationY,
  }));
}

export async function GET() {
  const layout = await readWorldLayout();

  try {
    const companyPortals = await getDatabaseCompanyPortals();

    if (companyPortals.length === 0) {
      return Response.json(layout);
    }

    return Response.json({
      items: [
        ...layout.items.filter((item) => !isCompanyPortalItem(item)),
        ...companyPortals,
      ],
    });
  } catch {
    return Response.json(layout);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const payload = worldLayoutSchema.parse(await request.json());
  await writeFile(
    worldLayoutPath,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
  return Response.json({ ok: true });
}
