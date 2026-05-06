import Link from "next/link";

import { PageShell, PanelCard, SectionLabel } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

export default async function AdminPage() {
  const { admin, session } = await requireAdminPage();

  const [companyCount, portalCount, admins, llmConfig] = await Promise.all([
    db.company.count().catch(() => 0),
    db.companyPortal.count().catch(() => 0),
    db.adminWhitelist
      .findMany({
        orderBy: { updatedAt: "desc" },
        select: { email: true, isActive: true, role: true },
        take: 8,
      })
      .catch(() => []),
    db.globalLlmConfig.findUnique({ where: { id: "global" } }).catch(() => null),
  ]);

  return (
    <PageShell className="px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 border-b border-white/10 pb-6">
          <SectionLabel tracking="wide">Admin</SectionLabel>
          <h1 className="text-3xl font-bold text-white">Panel de configuracion</h1>
          <p className="text-intervee-text-soft max-w-3xl text-sm">
            Acceso permitido solo por Google OAuth y whitelist. Los secretos de
            proveedores LLM se leen desde variables de entorno, no desde la BD.
          </p>
          <p className="text-intervee-text-soft text-xs">
            Sesion: {session.user.email} ({admin.role})
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <PanelCard>
            <SectionLabel size="xs">Empresas</SectionLabel>
            <div className="mt-3 text-4xl font-bold text-white">{companyCount}</div>
          </PanelCard>
          <PanelCard>
            <SectionLabel size="xs">Portales</SectionLabel>
            <div className="mt-3 text-4xl font-bold text-white">{portalCount}</div>
          </PanelCard>
          <PanelCard>
            <SectionLabel size="xs">LLM global</SectionLabel>
            <div className="mt-3 text-lg font-semibold text-white">
              {llmConfig ? `${llmConfig.provider}/${llmConfig.model}` : "Env fallback"}
            </div>
          </PanelCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <PanelCard>
            <SectionLabel size="xs">Acciones</SectionLabel>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link className="border-intervee-border bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/admin/companies">
                Configurar empresas
              </Link>
              <Link className="border-intervee-border bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/admin/settings/llm">
                Configurar LLM
              </Link>
              <Link className="border-intervee-border bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/admin/access">
                Configurar acceso
              </Link>
              <Link className="border-intervee-border bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/editor">
                Abrir editor del mundo
              </Link>
              <Link className="border-intervee-border bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/api/auth/signout">
                Cerrar sesion
              </Link>
            </div>
          </PanelCard>

          <PanelCard>
            <SectionLabel size="xs">Whitelist</SectionLabel>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white">
              {admins.length > 0 ? (
                admins.map((item) => (
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2" key={item.email}>
                    <span>{item.email}</span>
                    <span className="text-intervee-text-soft">{item.role}{item.isActive ? "" : " inactivo"}</span>
                  </div>
                ))
              ) : (
                <p className="text-intervee-text-soft">
                  No hay admins en BD o las migraciones aun no se ejecutaron.
                </p>
              )}
            </div>
          </PanelCard>
        </div>
      </div>
    </PageShell>
  );
}
