import Link from "next/link";
import { revalidatePath } from "next/cache";

import { PageShell, PanelCard, SectionLabel, StatusPill } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const inputClass =
  "border-intervee-border bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-intervee-connect w-full";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function numberValue(formData: FormData, key: string, fallback: number) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function createCompanyBundle(formData: FormData) {
  "use server";

  const { session } = await requireAdminPage();

  const company = await db.company.create({
    data: {
      description: value(formData, "description"),
      location: value(formData, "location") || null,
      logoUrl: value(formData, "logoUrl") || null,
      name: value(formData, "name"),
      slug: value(formData, "slug"),
      themeColor: value(formData, "themeColor") || null,
    },
  });

  await db.interviewProfile.create({
    data: {
      companyId: company.id,
      documentKey: value(formData, "documentKey") || company.slug,
      documentText: value(formData, "documentText"),
      documentTitle: value(formData, "documentTitle"),
      evaluationPrompt: value(formData, "evaluationPrompt") || null,
      maxOutputTokens: numberValue(formData, "maxOutputTokens", 1600),
      passScore: numberValue(formData, "passScore", 72),
      questionCount: numberValue(formData, "questionCount", 5),
      questionPrompt: value(formData, "questionPrompt") || null,
      roleTitle: value(formData, "roleTitle"),
      systemPrompt: value(formData, "systemPrompt") || null,
      temperature: numberValue(formData, "temperature", 0.35),
    },
  });

  await db.companyPortal.create({
    data: {
      activationRadius: numberValue(formData, "activationRadius", 1.6),
      companyId: company.id,
      logoUrl: value(formData, "portalLogoUrl") || null,
      positionX: numberValue(formData, "positionX", 0),
      positionY: numberValue(formData, "positionY", 0.2),
      positionZ: numberValue(formData, "positionZ", 0),
      themeColor: value(formData, "portalThemeColor") || null,
    },
  });

  await db.adminAuditLog.create({
    data: {
      action: "companyBundle.create",
      actorId: session.user.id,
      entity: "Company",
      entityId: company.id,
      after: { companyId: company.id, slug: company.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/api/world-layout");
}

async function duplicateCompany(formData: FormData) {
  "use server";

  const { session } = await requireAdminPage();
  const sourceId = value(formData, "sourceId");
  if (!sourceId) return;

  const source = await db.company.findUnique({
    include: {
      interviewProfiles: true,
      portals: true,
    },
    where: { id: sourceId },
  });
  if (!source) return;

  const baseSlug = `${source.slug}-copia`;
  let slug = baseSlug;
  let attempt = 1;
  while (await db.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt}`;
    attempt++;
  }

  const copy = await db.company.create({
    data: {
      description: source.description,
      isActive: false,
      location: source.location,
      logoUrl: source.logoUrl,
      name: `${source.name} (copia)`,
      slug,
      themeColor: source.themeColor,
    },
  });

  for (const profile of source.interviewProfiles) {
    await db.interviewProfile.create({
      data: {
        companyId: copy.id,
        documentKey: profile.documentKey,
        documentText: profile.documentText,
        documentTitle: profile.documentTitle,
        evaluationPrompt: profile.evaluationPrompt,
        maxOutputTokens: profile.maxOutputTokens,
        passScore: profile.passScore,
        questionCount: profile.questionCount,
        questionPrompt: profile.questionPrompt,
        roleTitle: profile.roleTitle,
        systemPrompt: profile.systemPrompt,
        temperature: profile.temperature,
      },
    });
  }

  for (const portal of source.portals) {
    await db.companyPortal.create({
      data: {
        activationRadius: portal.activationRadius,
        companyId: copy.id,
        logoUrl: portal.logoUrl,
        positionX: portal.positionX,
        positionY: portal.positionY,
        positionZ: portal.positionZ,
        themeColor: portal.themeColor,
      },
    });
  }

  await db.adminAuditLog.create({
    data: {
      action: "companyBundle.duplicate",
      actorId: session.user.id,
      entity: "Company",
      entityId: copy.id,
      after: { copyId: copy.id, sourceId, slug: copy.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/api/world-layout");
}

export default async function AdminCompaniesPage() {
  await requireAdminPage();

  const companies = await db.company.findMany({
    include: {
      interviewProfiles: { orderBy: { updatedAt: "desc" } },
      portals: { orderBy: { updatedAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageShell className="bg-transparent px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-white/10 pb-5">
          <SectionLabel tracking="wide">Empresas</SectionLabel>
          <h1 className="mt-1 text-3xl font-bold text-white">Gestión de empresas</h1>
          <p className="text-intervee-text-soft mt-1 text-sm">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} registrada
            {companies.length !== 1 ? "s" : ""}.
          </p>
        </header>

        {/* Companies table */}
        <PanelCard overflow>
          <SectionLabel size="xs">Empresas existentes</SectionLabel>
          {companies.length === 0 ? (
            <p className="text-intervee-text-soft mt-4 py-4 text-sm">
              No hay empresas registradas. Usa el formulario de abajo para crear una.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-intervee-text-soft py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="text-intervee-text-soft py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider">
                      Perfiles
                    </th>
                    <th className="text-intervee-text-soft py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider">
                      Portales
                    </th>
                    <th className="text-intervee-text-soft py-2 pr-6 text-left text-xs font-semibold uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-intervee-text-soft py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr className="border-b border-white/5 hover:bg-white/5" key={company.id}>
                      <td className="py-3 pr-6">
                        <div className="font-semibold text-white">{company.name}</div>
                        <div className="text-intervee-text-soft text-xs">/{company.slug}</div>
                        {company.location && (
                          <div className="text-intervee-text-soft text-xs">{company.location}</div>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-intervee-text-soft text-xs">
                          {company.interviewProfiles.length} perfil
                          {company.interviewProfiles.length !== 1 ? "es" : ""}
                        </span>
                        {company.interviewProfiles[0] && (
                          <div className="mt-0.5 text-xs text-white/50">
                            {company.interviewProfiles[0].roleTitle}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-intervee-text-soft text-xs">
                          {company.portals.length} portal
                          {company.portals.length !== 1 ? "es" : ""}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <StatusPill
                          label={company.isActive ? "activa" : "inactiva"}
                          tone={company.isActive ? "success" : "neutral"}
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link
                            className="border-intervee-border border bg-intervee-connect/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-intervee-connect/40"
                            href={`/admin/companies/${company.id}`}
                          >
                            Editar
                          </Link>
                          <form action={duplicateCompany}>
                            <input name="sourceId" type="hidden" value={company.id} />
                            <button
                              className="border-intervee-border border bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                              type="submit"
                            >
                              Duplicar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>

        {/* Create form */}
        <PanelCard>
          <SectionLabel size="xs">Crear nueva empresa</SectionLabel>
          <h2 className="mt-1 text-lg font-bold text-white">Configurar empresa completa</h2>
          <p className="text-intervee-text-soft mt-1 mb-5 text-xs">
            Crea empresa, perfil de entrevista y portal en un solo paso.
          </p>
          <form action={createCompanyBundle} className="grid gap-5">
            {/* Company basics */}
            <fieldset className="grid gap-3">
              <legend className="text-intervee-text-soft mb-2 text-xs font-semibold uppercase tracking-wider">
                Datos de la empresa
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Nombre</label>
                  <input className={inputClass} name="name" placeholder="Nombre de la empresa" required />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Slug</label>
                  <input className={inputClass} name="slug" pattern="[a-z0-9-]+" placeholder="empresa-slug" required />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs">Descripción</label>
                <input className={inputClass} name="description" placeholder="Descripción breve" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Ubicación</label>
                  <input className={inputClass} name="location" placeholder="Ciudad, País" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Logo URL</label>
                  <input className={inputClass} name="logoUrl" placeholder="https://..." />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Color tema</label>
                  <input className={inputClass} name="themeColor" placeholder="#7dd3fc" />
                </div>
              </div>
            </fieldset>

            {/* Interview profile */}
            <fieldset className="grid gap-3 border-t border-white/10 pt-4">
              <legend className="text-intervee-text-soft mb-2 text-xs font-semibold uppercase tracking-wider">
                Perfil de entrevista
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Rol</label>
                  <input className={inputClass} name="roleTitle" placeholder="Desarrollador Backend" required />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Document key</label>
                  <input className={inputClass} name="documentKey" placeholder="auto (usa el slug)" />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs">Título del brief</label>
                <input className={inputClass} name="documentTitle" placeholder="Brief técnico" required />
              </div>
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs">Brief / documento base</label>
                <textarea className={`${inputClass} min-h-28`} name="documentText" placeholder="Contenido del brief de entrevista..." required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">System prompt adicional</label>
                  <textarea className={`${inputClass} min-h-16`} name="systemPrompt" placeholder="Instrucciones adicionales para el LLM..." />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Prompt de preguntas</label>
                  <textarea className={`${inputClass} min-h-16`} name="questionPrompt" placeholder="Prompt adicional para generar preguntas..." />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-intervee-text-soft text-xs">Prompt de evaluación</label>
                <textarea className={`${inputClass} min-h-16`} name="evaluationPrompt" placeholder="Prompt adicional para evaluar respuestas..." />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">N° preguntas</label>
                  <input className={inputClass} name="questionCount" placeholder="5" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Puntaje mínimo</label>
                  <input className={inputClass} name="passScore" placeholder="72" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Temperatura</label>
                  <input className={inputClass} name="temperature" placeholder="0.35" step="0.01" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Max tokens</label>
                  <input className={inputClass} name="maxOutputTokens" placeholder="1600" type="number" />
                </div>
              </div>
            </fieldset>

            {/* Portal */}
            <fieldset className="grid gap-3 border-t border-white/10 pt-4">
              <legend className="text-intervee-text-soft mb-2 text-xs font-semibold uppercase tracking-wider">
                Portal en el mundo
              </legend>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Posición X</label>
                  <input className={inputClass} name="positionX" placeholder="0" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Posición Y</label>
                  <input className={inputClass} name="positionY" placeholder="0.2" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Posición Z</label>
                  <input className={inputClass} name="positionZ" placeholder="0" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Radio activación</label>
                  <input className={inputClass} name="activationRadius" placeholder="1.6" type="number" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Logo del portal</label>
                  <input className={inputClass} name="portalLogoUrl" placeholder="https://..." />
                </div>
                <div className="grid gap-1">
                  <label className="text-intervee-text-soft text-xs">Color del portal</label>
                  <input className={inputClass} name="portalThemeColor" placeholder="#7dd3fc" />
                </div>
              </div>
            </fieldset>

            <button
              className="bg-intervee-connect hover:bg-intervee-connect-hover mt-1 px-5 py-3 text-sm font-bold text-white transition"
              type="submit"
            >
              Crear empresa
            </button>
          </form>
        </PanelCard>
      </div>
    </PageShell>
  );
}
