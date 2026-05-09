import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { PageShell, PanelCard, SectionLabel, StatusPill } from "~/components/ui";
import { requireAdminPage } from "~/server/auth/admin";
import { db } from "~/server/db";

const inputClass =
  "border-intervee-border bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-intervee-connect w-full";

const labelClass = "text-intervee-text-soft text-xs";

function val(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}
function num(formData: FormData, key: string, fallback: number) {
  const parsed = Number(val(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function updateCompany(formData: FormData) {
  "use server";
  const { session } = await requireAdminPage();
  const id = val(formData, "companyId");
  if (!id) return;

  const company = await db.company.update({
    data: {
      description: val(formData, "description"),
      isActive: formData.get("isActive") === "on",
      location: val(formData, "location") || null,
      logoUrl: val(formData, "logoUrl") || null,
      name: val(formData, "name"),
      slug: val(formData, "slug"),
      themeColor: val(formData, "themeColor") || null,
    },
    where: { id },
  });

  await db.adminAuditLog.create({
    data: {
      action: "company.update",
      actorId: session.user.id,
      entity: "Company",
      entityId: id,
      after: { slug: company.slug },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${id}`);
  revalidatePath("/api/world-layout");
}

async function updateProfile(formData: FormData) {
  "use server";
  const { session } = await requireAdminPage();
  const profileId = val(formData, "profileId");
  const companyId = val(formData, "companyId");
  if (!profileId || !companyId) return;

  await db.interviewProfile.update({
    data: {
      documentKey: val(formData, "documentKey"),
      documentText: val(formData, "documentText"),
      documentTitle: val(formData, "documentTitle"),
      evaluationPrompt: val(formData, "evaluationPrompt") || null,
      isActive: formData.get("isActive") === "on",
      maxOutputTokens: num(formData, "maxOutputTokens", 1600),
      passScore: num(formData, "passScore", 72),
      questionCount: num(formData, "questionCount", 5),
      questionPrompt: val(formData, "questionPrompt") || null,
      roleTitle: val(formData, "roleTitle"),
      systemPrompt: val(formData, "systemPrompt") || null,
      temperature: num(formData, "temperature", 0.35),
    },
    where: { id: profileId },
  });

  await db.adminAuditLog.create({
    data: {
      action: "interviewProfile.update",
      actorId: session.user.id,
      entity: "InterviewProfile",
      entityId: profileId,
      after: { companyId, profileId },
    },
  });

  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/api/world-layout");
}

async function updatePortal(formData: FormData) {
  "use server";
  const { session } = await requireAdminPage();
  const portalId = val(formData, "portalId");
  const companyId = val(formData, "companyId");
  if (!portalId || !companyId) return;

  await db.companyPortal.update({
    data: {
      activationRadius: num(formData, "activationRadius", 1.6),
      isActive: formData.get("isActive") === "on",
      logoUrl: val(formData, "logoUrl") || null,
      positionX: num(formData, "positionX", 0),
      positionY: num(formData, "positionY", 0.2),
      positionZ: num(formData, "positionZ", 0),
      themeColor: val(formData, "themeColor") || null,
    },
    where: { id: portalId },
  });

  await db.adminAuditLog.create({
    data: {
      action: "companyPortal.update",
      actorId: session.user.id,
      entity: "CompanyPortal",
      entityId: portalId,
      after: { companyId, portalId },
    },
  });

  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/api/world-layout");
}

async function deleteCompany(formData: FormData) {
  "use server";
  const { session } = await requireAdminPage();
  const id = val(formData, "companyId");
  if (!id) return;

  await db.company.delete({ where: { id } });

  await db.adminAuditLog.create({
    data: {
      action: "company.delete",
      actorId: session.user.id,
      entity: "Company",
      entityId: id,
      after: {},
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/api/world-layout");
  redirect("/admin/companies");
}

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;

  const company = await db.company.findUnique({
    include: {
      interviewProfiles: { orderBy: { updatedAt: "desc" } },
      portals: { orderBy: { updatedAt: "desc" } },
    },
    where: { id },
  });

  if (!company) notFound();

  return (
    <PageShell className="bg-transparent px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="border-b border-white/10 pb-5">
          <SectionLabel tracking="wide">
            <a className="hover:text-white" href="/admin/companies">
              Empresas
            </a>{" "}
            / Editar
          </SectionLabel>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <StatusPill
              label={company.isActive ? "activa" : "inactiva"}
              tone={company.isActive ? "success" : "neutral"}
            />
          </div>
          <p className="text-intervee-text-soft mt-1 text-xs">/{company.slug}</p>
        </header>

        {/* Company fields */}
        <PanelCard>
          <SectionLabel size="xs">Datos de la empresa</SectionLabel>
          <form action={updateCompany} className="mt-4 grid gap-4">
            <input name="companyId" type="hidden" value={company.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre">
                <input className={inputClass} defaultValue={company.name} name="name" required />
              </Field>
              <Field label="Slug">
                <input className={inputClass} defaultValue={company.slug} name="slug" pattern="[a-z0-9-]+" required />
              </Field>
            </div>
            <Field label="Descripción">
              <input className={inputClass} defaultValue={company.description} name="description" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Ubicación">
                <input className={inputClass} defaultValue={company.location ?? ""} name="location" />
              </Field>
              <Field label="Logo URL">
                <input className={inputClass} defaultValue={company.logoUrl ?? ""} name="logoUrl" />
              </Field>
              <Field label="Color tema">
                <input className={inputClass} defaultValue={company.themeColor ?? ""} name="themeColor" placeholder="#7dd3fc" />
              </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
              <input defaultChecked={company.isActive} name="isActive" type="checkbox" />
              Empresa activa
            </label>
            <div className="flex gap-3 border-t border-white/10 pt-3">
              <button
                className="bg-intervee-connect hover:bg-intervee-connect-hover px-5 py-2.5 text-sm font-bold text-white transition"
                type="submit"
              >
                Guardar empresa
              </button>
            </div>
          </form>
        </PanelCard>

        {/* Interview profiles */}
        {company.interviewProfiles.map((profile, i) => (
          <PanelCard key={profile.id}>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel size="xs">
                Perfil de entrevista {company.interviewProfiles.length > 1 ? `#${i + 1}` : ""}
              </SectionLabel>
              <StatusPill
                label={profile.isActive ? "activo" : "inactivo"}
                tone={profile.isActive ? "success" : "neutral"}
              />
            </div>
            <form action={updateProfile} className="grid gap-4">
              <input name="companyId" type="hidden" value={company.id} />
              <input name="profileId" type="hidden" value={profile.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rol">
                  <input className={inputClass} defaultValue={profile.roleTitle} name="roleTitle" required />
                </Field>
                <Field label="Document key">
                  <input className={inputClass} defaultValue={profile.documentKey} name="documentKey" required />
                </Field>
              </div>
              <Field label="Título del brief">
                <input className={inputClass} defaultValue={profile.documentTitle} name="documentTitle" required />
              </Field>
              <Field label="Brief / documento base">
                <textarea className={`${inputClass} min-h-32`} defaultValue={profile.documentText} name="documentText" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="System prompt adicional">
                  <textarea className={`${inputClass} min-h-20`} defaultValue={profile.systemPrompt ?? ""} name="systemPrompt" />
                </Field>
                <Field label="Prompt de preguntas">
                  <textarea className={`${inputClass} min-h-20`} defaultValue={profile.questionPrompt ?? ""} name="questionPrompt" />
                </Field>
              </div>
              <Field label="Prompt de evaluación">
                <textarea className={`${inputClass} min-h-20`} defaultValue={profile.evaluationPrompt ?? ""} name="evaluationPrompt" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="N° preguntas">
                  <input className={inputClass} defaultValue={profile.questionCount} name="questionCount" type="number" />
                </Field>
                <Field label="Puntaje mínimo">
                  <input className={inputClass} defaultValue={profile.passScore} name="passScore" type="number" />
                </Field>
                <Field label="Temperatura">
                  <input className={inputClass} defaultValue={profile.temperature} name="temperature" step="0.01" type="number" />
                </Field>
                <Field label="Max tokens">
                  <input className={inputClass} defaultValue={profile.maxOutputTokens} name="maxOutputTokens" type="number" />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                <input defaultChecked={profile.isActive} name="isActive" type="checkbox" />
                Perfil activo
              </label>
              <div className="border-t border-white/10 pt-3">
                <button
                  className="bg-intervee-connect hover:bg-intervee-connect-hover px-5 py-2.5 text-sm font-bold text-white transition"
                  type="submit"
                >
                  Guardar perfil
                </button>
              </div>
            </form>
          </PanelCard>
        ))}

        {/* Portals */}
        {company.portals.map((portal, i) => (
          <PanelCard key={portal.id}>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel size="xs">
                Portal {company.portals.length > 1 ? `#${i + 1}` : ""}
              </SectionLabel>
              <StatusPill
                label={portal.isActive ? "activo" : "inactivo"}
                tone={portal.isActive ? "success" : "neutral"}
              />
            </div>
            <form action={updatePortal} className="grid gap-4">
              <input name="companyId" type="hidden" value={company.id} />
              <input name="portalId" type="hidden" value={portal.id} />
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Posición X">
                  <input className={inputClass} defaultValue={portal.positionX} name="positionX" type="number" />
                </Field>
                <Field label="Posición Y">
                  <input className={inputClass} defaultValue={portal.positionY} name="positionY" type="number" />
                </Field>
                <Field label="Posición Z">
                  <input className={inputClass} defaultValue={portal.positionZ} name="positionZ" type="number" />
                </Field>
                <Field label="Radio activación">
                  <input className={inputClass} defaultValue={portal.activationRadius} name="activationRadius" step="0.1" type="number" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo URL">
                  <input className={inputClass} defaultValue={portal.logoUrl ?? ""} name="logoUrl" />
                </Field>
                <Field label="Color tema">
                  <input className={inputClass} defaultValue={portal.themeColor ?? ""} name="themeColor" placeholder="#7dd3fc" />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                <input defaultChecked={portal.isActive} name="isActive" type="checkbox" />
                Portal activo
              </label>
              <div className="border-t border-white/10 pt-3">
                <button
                  className="bg-intervee-connect hover:bg-intervee-connect-hover px-5 py-2.5 text-sm font-bold text-white transition"
                  type="submit"
                >
                  Guardar portal
                </button>
              </div>
            </form>
          </PanelCard>
        ))}

        {/* Danger zone */}
        <PanelCard>
          <SectionLabel size="xs">Zona peligrosa</SectionLabel>
          <p className="text-intervee-text-soft mt-2 mb-4 text-sm">
            Eliminar la empresa borra en cascada todos sus perfiles y portales. Esta acción es
            irreversible.
          </p>
          <form action={deleteCompany}>
            <input name="companyId" type="hidden" value={company.id} />
            <button
              className="border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
              type="submit"
            >
              Eliminar empresa y todos sus datos
            </button>
          </form>
        </PanelCard>
      </div>
    </PageShell>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-intervee-text-soft text-xs">{label}</label>
      {children}
    </div>
  );
}
