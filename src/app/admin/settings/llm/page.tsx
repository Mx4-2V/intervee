import { revalidatePath } from "next/cache";
import type { Prisma } from "../../../../../generated/prisma";

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

async function updateLlmConfig(formData: FormData) {
  "use server";

  const { session } = await requireAdminPage();
  const config = await db.globalLlmConfig.upsert({
    create: {
      id: "global",
      baseUrl: value(formData, "baseUrl") || null,
      maxOutputTokens: numberValue(formData, "maxOutputTokens", 1600),
      model: value(formData, "model"),
      provider: value(formData, "provider"),
      temperature: numberValue(formData, "temperature", 0.35),
    },
    update: {
      baseUrl: value(formData, "baseUrl") || null,
      maxOutputTokens: numberValue(formData, "maxOutputTokens", 1600),
      model: value(formData, "model"),
      provider: value(formData, "provider"),
      temperature: numberValue(formData, "temperature", 0.35),
    },
    where: { id: "global" },
  });

  await db.adminAuditLog.create({
    data: {
      action: "llmConfig.update",
      actorId: session.user.id,
      entity: "GlobalLlmConfig",
      entityId: config.id,
      after: JSON.parse(JSON.stringify(config)) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings/llm");
}

export default async function AdminLlmSettingsPage() {
  await requireAdminPage();

  const config = await db.globalLlmConfig.findUnique({ where: { id: "global" } });

  return (
    <PageShell className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <PanelCard>
          <SectionLabel tracking="wide">LLM global</SectionLabel>
          <h1 className="mt-2 text-2xl font-bold text-white">Configurar modelo del sistema</h1>
          <p className="text-intervee-text-soft mt-2 text-sm">
            Esta pantalla no guarda API keys. Las credenciales se leen desde env:
            `GOOGLE_AI_API_KEY`, `OPENAI_AI_API_KEY`, `ANTHROPIC_AI_API_KEY`,
            `GROQ_AI_API_KEY`, `OPENAI_COMPATIBLE_AI_API_KEY` o `AI_GATEWAY_API_KEY`.
          </p>

          <form action={updateLlmConfig} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm text-white">
              Provider
              <select className={inputClass} defaultValue={config?.provider ?? "google"} name="provider">
                <option value="gateway">gateway</option>
                <option value="google">google</option>
                <option value="openai">openai</option>
                <option value="anthropic">anthropic</option>
                <option value="groq">groq</option>
                <option value="openai-compatible">openai-compatible</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-white">
              Modelo
              <input className={inputClass} defaultValue={config?.model ?? "gemini-2.5-flash"} name="model" required />
            </label>
            <label className="grid gap-2 text-sm text-white">
              Base URL opcional
              <input className={inputClass} defaultValue={config?.baseUrl ?? ""} name="baseUrl" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-white">
                Temperatura
                <input className={inputClass} defaultValue={config?.temperature ?? 0.35} max="2" min="0" name="temperature" step="0.01" type="number" />
              </label>
              <label className="grid gap-2 text-sm text-white">
                Max output tokens
                <input className={inputClass} defaultValue={config?.maxOutputTokens ?? 1600} min="1" name="maxOutputTokens" type="number" />
              </label>
            </div>
            <button className="bg-intervee-connect hover:bg-intervee-connect-hover px-5 py-3 text-sm font-bold text-white" type="submit">
              Guardar LLM global
            </button>
          </form>
        </PanelCard>
      </div>
    </PageShell>
  );
}
