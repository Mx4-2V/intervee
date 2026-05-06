import { revalidatePath } from "next/cache";

import { PageShell, PanelCard, SectionLabel } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const inputClass =
  "border-intervee-border bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-intervee-connect";

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
    <PageShell className="px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <PanelCard>
          <SectionLabel tracking="wide">Empresas</SectionLabel>
          <h1 className="mt-2 text-2xl font-bold text-white">Crear empresa configurable</h1>
          <form action={createCompanyBundle} className="mt-5 grid gap-3">
            <input className={inputClass} name="name" placeholder="Nombre" required />
            <input className={inputClass} name="slug" pattern="[a-z0-9-]+" placeholder="slug" required />
            <input className={inputClass} name="description" placeholder="Descripcion" required />
            <input className={inputClass} name="location" placeholder="Ubicacion" />
            <input className={inputClass} name="logoUrl" placeholder="Logo URL" />
            <input className={inputClass} name="themeColor" placeholder="#7dd3fc" />
            <input className={inputClass} name="roleTitle" placeholder="Rol de entrevista" required />
            <input className={inputClass} name="documentKey" placeholder="document key" />
            <input className={inputClass} name="documentTitle" placeholder="Titulo del brief" required />
            <textarea className={`${inputClass} min-h-36`} name="documentText" placeholder="Brief/documento base de la entrevista" required />
            <textarea className={`${inputClass} min-h-20`} name="systemPrompt" placeholder="System prompt adicional opcional" />
            <textarea className={`${inputClass} min-h-20`} name="questionPrompt" placeholder="Prompt adicional para preguntas" />
            <textarea className={`${inputClass} min-h-20`} name="evaluationPrompt" placeholder="Prompt adicional para evaluacion" />
            <div className="grid gap-3 sm:grid-cols-4">
              <input className={inputClass} name="questionCount" placeholder="5" type="number" />
              <input className={inputClass} name="passScore" placeholder="72" type="number" />
              <input className={inputClass} name="temperature" placeholder="0.35" step="0.01" type="number" />
              <input className={inputClass} name="maxOutputTokens" placeholder="1600" type="number" />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <input className={inputClass} name="positionX" placeholder="Portal X" type="number" />
              <input className={inputClass} name="positionY" placeholder="Portal Y" type="number" />
              <input className={inputClass} name="positionZ" placeholder="Portal Z" type="number" />
              <input className={inputClass} name="activationRadius" placeholder="Radio" type="number" />
            </div>
            <input className={inputClass} name="portalLogoUrl" placeholder="Logo del portal opcional" />
            <input className={inputClass} name="portalThemeColor" placeholder="Color del portal opcional" />
            <button className="bg-intervee-connect hover:bg-intervee-connect-hover mt-2 px-5 py-3 text-sm font-bold text-white" type="submit">
              Crear empresa
            </button>
          </form>
        </PanelCard>

        <PanelCard>
          <SectionLabel tracking="wide">Existentes</SectionLabel>
          <div className="mt-4 flex flex-col gap-3">
            {companies.map((company) => (
              <div className="border-intervee-border border bg-white/5 p-4" key={company.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{company.name}</h2>
                    <p className="text-intervee-text-soft text-sm">/{company.slug}</p>
                  </div>
                  <span className="text-intervee-text-soft text-xs">{company.isActive ? "activa" : "inactiva"}</span>
                </div>
                <p className="text-intervee-text-soft mt-3 text-sm">{company.description}</p>
                <div className="text-intervee-text-soft mt-3 text-xs">
                  {company.interviewProfiles.length} perfiles, {company.portals.length} portales
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </PageShell>
  );
}
