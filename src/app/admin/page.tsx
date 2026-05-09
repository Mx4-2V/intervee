import Link from "next/link";

import { PageShell, PanelCard, SectionLabel, StatusPill } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const ACTIONS = [
  { href: "/admin/companies", label: "Configurar empresas" },
  { href: "/admin/settings/llm", label: "Configurar LLM" },
  { href: "/admin/access", label: "Gestionar acceso" },
  { href: "/editor", label: "Editor del mundo" },
];

export default async function AdminPage() {
  const { admin, session } = await requireAdminPage();

  const [companyCount, portalCount, admins, llmConfig] = await Promise.all([
    db.company.count().catch(() => 0),
    db.companyPortal.count().catch(() => 0),
    db.adminWhitelist
      .findMany({ orderBy: { updatedAt: "desc" } })
      .catch(() => []),
    db.globalLlmConfig.findUnique({ where: { id: "global" } }).catch(() => null),
  ]);

  return (
    <PageShell className="bg-transparent px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-1 border-b border-white/10 pb-5">
          <SectionLabel tracking="wide">Admin</SectionLabel>
          <h1 className="text-3xl font-bold text-white">Panel de configuración</h1>
          <p className="text-intervee-text-soft text-xs">
            {session.user.email} — {admin.role}
          </p>
        </header>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <PanelCard>
            <SectionLabel size="xs">Empresas</SectionLabel>
            <div className="mt-2 text-4xl font-bold text-white">{companyCount}</div>
          </PanelCard>
          <PanelCard>
            <SectionLabel size="xs">Portales</SectionLabel>
            <div className="mt-2 text-4xl font-bold text-white">{portalCount}</div>
          </PanelCard>
          <PanelCard>
            <SectionLabel size="xs">LLM global</SectionLabel>
            <div className="mt-2 text-lg font-semibold text-white">
              {llmConfig ? `${llmConfig.provider} / ${llmConfig.model}` : "Env fallback"}
            </div>
            <p className="text-intervee-text-soft mt-1 text-xs">
              {llmConfig ? `temp ${llmConfig.temperature} · ${llmConfig.maxOutputTokens} tokens` : "sin config en BD"}
            </p>
          </PanelCard>
        </div>

        {/* Quick actions */}
        <PanelCard padding="sm">
          <SectionLabel size="xs">Acciones rápidas</SectionLabel>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {ACTIONS.map(({ href, label }) => (
              <Link
                className="border-intervee-border flex items-center justify-center border bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
        </PanelCard>

        {/* Users whitelist table */}
        <PanelCard overflow>
          <SectionLabel size="xs">Usuarios permitidos</SectionLabel>
          <p className="text-intervee-text-soft mt-1 mb-4 text-xs">
            {admins.length} usuario{admins.length !== 1 ? "s" : ""} en whitelist —{" "}
            <Link className="underline hover:text-white" href="/admin/access">
              gestionar acceso
            </Link>
          </p>
          {admins.length === 0 ? (
            <p className="text-intervee-text-soft py-4 text-sm">
              No hay usuarios registrados o las migraciones aún no se ejecutaron.
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
                    <th className="text-intervee-text-soft py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((item) => (
                    <tr className="border-b border-white/5 hover:bg-white/5" key={item.email}>
                      <td className="py-2.5 pr-4 text-white">{item.email}</td>
                      <td className="py-2.5 pr-4">
                        <RoleBadge role={item.role} />
                      </td>
                      <td className="py-2.5">
                        <StatusPill
                          label={item.isActive ? "activo" : "inactivo"}
                          tone={item.isActive ? "success" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>
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
    <span className={`inline-flex border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${cls}`}>
      {role}
    </span>
  );
}
