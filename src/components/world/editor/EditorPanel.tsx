"use client";

import {
  BILLBOARD_IMAGE_OPTIONS,
  COMPANY_PORTAL_LOGO_OPTIONS,
  WORLD_EDITOR_GROUPS,
  type CompanyPortalConfig,
  type WorldItem,
} from "~/lib/world-layout";

import type { SaveStatus } from "~/components/world/shared/types";

export function EditorPanel({
  activeAsset,
  onDeleteSelected,
  onDuplicateSelected,
  onNudgeRotation,
  onSave,
  onSelectAsset,
  onUpdateSelectedCompanyPortalField,
  onUpdateSelectedImageUrl,
  onUpdateSelectedItem,
  saveStatus,
  selectedItem,
}: {
  activeAsset: string | null;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onNudgeRotation: (delta: number) => void;
  onSave: () => void;
  onSelectAsset: (asset: string) => void;
  onUpdateSelectedCompanyPortalField: (
    field: keyof CompanyPortalConfig,
    value: number | string,
  ) => void;
  onUpdateSelectedImageUrl: (imageUrl: string) => void;
  onUpdateSelectedItem: (axis: "x" | "y" | "z", value: number) => void;
  saveStatus: SaveStatus;
  selectedItem: WorldItem | undefined;
}) {
  return (
    <>
      <aside className="absolute top-4 left-4 z-10 flex max-h-[calc(100vh-2rem)] w-72 flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-4 text-white backdrop-blur">
        <div className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">
          Editor
        </div>
        <div className="text-xs text-slate-300">
          Elige un asset y haz click en el suelo para colocarlo. El marcador
          azul indica el punto inicial del mapa.
        </div>
        <div className="text-xs text-slate-300">Guardado: {saveStatus}</div>
        <button
          className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950"
          onClick={onSave}
          type="button"
        >
          Guardar JSON ahora
        </button>

        {WORLD_EDITOR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.assets.map((asset) => (
                <button
                  className={`rounded-md px-2 py-2 text-left text-xs ${
                    activeAsset === asset
                      ? "bg-cyan-300 text-slate-950"
                      : "bg-white/10 text-slate-100"
                  }`}
                  key={asset}
                  onClick={() => onSelectAsset(asset)}
                  type="button"
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <aside className="absolute top-4 right-4 z-10 flex w-72 flex-col gap-3 rounded-xl border border-white/10 bg-black/70 p-4 text-white backdrop-blur">
        <div className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">
          Seleccion
        </div>
        {selectedItem ? (
          <>
            <div className="text-sm text-slate-100">{selectedItem.asset}</div>
            <label className="text-xs text-slate-300">
              X
              <input
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                onChange={(event) =>
                  onUpdateSelectedItem("x", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[0]}
              />
            </label>
            <label className="text-xs text-slate-300">
              Y
              <input
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                onChange={(event) =>
                  onUpdateSelectedItem("y", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[1]}
              />
            </label>
            <label className="text-xs text-slate-300">
              Z
              <input
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                onChange={(event) =>
                  onUpdateSelectedItem("z", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[2]}
              />
            </label>
            {selectedItem.asset === "billboard_16_9" ? (
              <label className="text-xs text-slate-300">
                Imagen
                <select
                  className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                  onChange={(event) =>
                    onUpdateSelectedImageUrl(event.target.value)
                  }
                  value={selectedItem.imageUrl ?? BILLBOARD_IMAGE_OPTIONS[0]}
                >
                  {BILLBOARD_IMAGE_OPTIONS.map((imageUrl) => (
                    <option key={imageUrl} value={imageUrl}>
                      {imageUrl.replace("/assets/ads/", "")}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {selectedItem.asset === "company_portal" ? (
              <>
                <label className="text-xs text-slate-300">
                  Empresa
                  <input
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "companyName",
                        event.target.value,
                      )
                    }
                    type="text"
                    value={
                      selectedItem.companyPortal?.companyName ?? "Microsoft"
                    }
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Slug
                  <input
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "companySlug",
                        event.target.value,
                      )
                    }
                    type="text"
                    value={
                      selectedItem.companyPortal?.companySlug ?? "microsoft"
                    }
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Ruta
                  <input
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "companyRoute",
                        event.target.value,
                      )
                    }
                    type="text"
                    value={
                      selectedItem.companyPortal?.companyRoute ??
                      "/companies/microsoft/interview"
                    }
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Documento
                  <input
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "documentKey",
                        event.target.value,
                      )
                    }
                    type="text"
                    value={
                      selectedItem.companyPortal?.documentKey ?? "microsoft"
                    }
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Logo
                  <select
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "logoUrl",
                        event.target.value,
                      )
                    }
                    value={
                      selectedItem.companyPortal?.logoUrl ??
                      COMPANY_PORTAL_LOGO_OPTIONS[0]
                    }
                  >
                    {COMPANY_PORTAL_LOGO_OPTIONS.map((logoUrl) => (
                      <option key={logoUrl} value={logoUrl}>
                        {logoUrl.replace("/assets/logos/", "")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-slate-300">
                  Radio de activacion
                  <input
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm"
                    min={1}
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "activationRadius",
                        Number(event.target.value),
                      )
                    }
                    step="0.1"
                    type="number"
                    value={selectedItem.companyPortal?.activationRadius ?? 3.2}
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Color
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/5 px-2 py-2"
                    onChange={(event) =>
                      onUpdateSelectedCompanyPortalField(
                        "themeColor",
                        event.target.value,
                      )
                    }
                    type="color"
                    value={selectedItem.companyPortal?.themeColor ?? "#7dd3fc"}
                  />
                </label>
              </>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-md bg-white/10 px-3 py-2 text-sm"
                onClick={() => onNudgeRotation(-Math.PI / 2)}
                type="button"
              >
                Rotar -90
              </button>
              <button
                className="rounded-md bg-white/10 px-3 py-2 text-sm"
                onClick={() => onNudgeRotation(Math.PI / 2)}
                type="button"
              >
                Rotar +90
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-md bg-cyan-300 px-3 py-2 text-sm text-slate-950"
                onClick={onDuplicateSelected}
                type="button"
              >
                Duplicar
              </button>
              <button
                className="rounded-md bg-rose-500 px-3 py-2 text-sm"
                onClick={onDeleteSelected}
                type="button"
              >
                Eliminar
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-300">
            Selecciona un objeto en la escena.
          </div>
        )}
      </aside>
    </>
  );
}
