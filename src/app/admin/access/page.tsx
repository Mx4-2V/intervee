import { revalidatePath } from "next/cache";
import type { Prisma } from "../../../../generated/prisma";

import { PageShell, PanelCard, SectionLabel } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const inputClass =
  "border-intervee-border bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-intervee-connect";

async function upsertAdmin(formData: FormData) {
  "use server";

  const { session } = await requireAdminPage();
  const emailEntry = formData.get("email");
  const roleEntry = formData.get("role");
  const email = typeof emailEntry === "string" ? emailEntry.trim().toLowerCase() : "";
  const role =
    roleEntry === "OWNER" || roleEntry === "VIEWER" ? roleEntry : "ADMIN";
  const isActive = formData.get("isActive") === "on";

  const entry = await db.adminWhitelist.upsert({
    create: { email, isActive, role },
    update: { isActive, role },
    where: { email },
  });

  await db.adminAuditLog.create({
    data: {
      action: "adminWhitelist.upsert",
      actorId: session.user.id,
      entity: "AdminWhitelist",
      entityId: entry.id,
      after: JSON.parse(JSON.stringify(entry)) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/access");
}

export default async function AdminAccessPage() {
  await requireAdminPage();

  const admins = await db.adminWhitelist.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <PageShell className="px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <PanelCard>
          <SectionLabel tracking="wide">Acceso</SectionLabel>
          <h1 className="mt-2 text-2xl font-bold text-white">Whitelist Google</h1>
          <form action={upsertAdmin} className="mt-5 grid gap-3">
            <input className={inputClass} name="email" placeholder="admin@example.com" required type="email" />
            <select className={inputClass} defaultValue="ADMIN" name="role">
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-white">
              <input defaultChecked name="isActive" type="checkbox" /> Activo
            </label>
            <button className="bg-intervee-connect hover:bg-intervee-connect-hover px-5 py-3 text-sm font-bold text-white" type="submit">
              Guardar acceso
            </button>
          </form>
        </PanelCard>

        <PanelCard>
          <SectionLabel tracking="wide">Usuarios permitidos</SectionLabel>
          <div className="mt-4 flex flex-col gap-2">
            {admins.map((admin) => (
              <div className="border-intervee-border flex items-center justify-between border bg-white/5 p-3 text-sm text-white" key={admin.id}>
                <span>{admin.email}</span>
                <span className="text-intervee-text-soft">{admin.role}{admin.isActive ? "" : " inactivo"}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </PageShell>
  );
}
