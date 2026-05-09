import { revalidatePath } from "next/cache";
import type { Prisma } from "../../../../generated/prisma";

import { PageShell, PanelCard, SectionLabel, StatusPill } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const inputClass =
  "border-intervee-border bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-intervee-connect w-full";

async function upsertAdmin(formData: FormData) {
  "use server";

  const { session } = await requireAdminPage();
  const emailEntry = formData.get("email");
  const roleEntry = formData.get("role");
  const email = typeof emailEntry === "string" ? emailEntry.trim().toLowerCase() : "";
  const role =
    roleEntry === "OWNER" || roleEntry === "ADMIN" ? roleEntry : "USER";
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
    <PageShell className="bg-transparent px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-white/10 pb-5">
          <SectionLabel tracking="wide">Acceso</SectionLabel>
          <h1 className="mt-1 text-3xl font-bold text-white">Gestión de usuarios</h1>
          <p className="text-intervee-text-soft mt-1 text-sm">
            Los usuarios en whitelist pueden autenticarse con Google OAuth. Solo los
            roles ADMIN y OWNER acceden al panel.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Add / edit form */}
          <PanelCard>
            <SectionLabel size="xs">Agregar o actualizar usuario</SectionLabel>
            <form action={upsertAdmin} className="mt-4 grid gap-3">
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs font-semibold uppercase tracking-wider">
                  Email
                </label>
                <input
                  className={inputClass}
                  name="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  type="email"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs font-semibold uppercase tracking-wider">
                  Rol
                </label>
                <select className={inputClass} defaultValue="USER" name="role">
                  <option value="USER">USER — solo acceso a entrevistas</option>
                  <option value="ADMIN">ADMIN — acceso al panel</option>
                  <option value="OWNER">OWNER — control total</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                <input defaultChecked name="isActive" type="checkbox" />
                Usuario activo
              </label>
              <button
                className="bg-intervee-connect hover:bg-intervee-connect-hover mt-1 px-5 py-3 text-sm font-bold text-white transition"
                type="submit"
              >
                Guardar usuario
              </button>
            </form>
            <p className="text-intervee-text-soft mt-4 text-xs">
              Si el email ya existe, se actualizarán su rol y estado.
            </p>
          </PanelCard>

          {/* Users table */}
          <PanelCard overflow>
            <div className="mb-4 flex items-center justify-between gap-4">
              <SectionLabel size="xs">Usuarios registrados</SectionLabel>
              <span className="text-intervee-text-soft text-xs">
                {admins.length} total
              </span>
            </div>
            {admins.length === 0 ? (
              <p className="text-intervee-text-soft py-6 text-sm">
                No hay usuarios en la whitelist aún.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-intervee-text-soft py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-intervee-text-soft py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="text-intervee-text-soft py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-intervee-text-soft py-2 text-left text-xs font-semibold uppercase tracking-wider">
                        Actualizado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((item) => (
                      <tr className="border-b border-white/5 hover:bg-white/5" key={item.id}>
                        <td className="py-3 pr-4 font-medium text-white">
                          {item.email}
                        </td>
                        <td className="py-3 pr-4">
                          <RoleBadge role={item.role} />
                        </td>
                        <td className="py-3 pr-4">
                          <StatusPill
                            label={item.isActive ? "activo" : "inactivo"}
                            tone={item.isActive ? "success" : "neutral"}
                          />
                        </td>
                        <td className="text-intervee-text-soft py-3 text-xs">
                          {item.updatedAt.toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PanelCard>
        </div>
      </div>
    </PageShell>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === "OWNER"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
      : role === "ADMIN"
        ? "border-blue-400/40 bg-blue-400/10 text-blue-300"
        : "border-white/20 bg-white/5 text-white/60";
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${cls}`}
    >
      {role}
    </span>
  );
}
