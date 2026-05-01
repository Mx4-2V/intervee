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
      <aside className="border-intervee-border bg-intervee-surface absolute top-4 left-4 z-10 flex max-h-[calc(100vh-2rem)] w-[19rem] flex-col gap-3 overflow-y-auto border-2 p-4 text-white shadow-md">
        <div className="text-intervee-text-soft text-sm font-semibold tracking-[0.2em] uppercase">
          Editor
        </div>
        <div className="text-intervee-text-soft text-xs">
          Elige un asset y haz click en el suelo para colocarlo. El marcador
          azul indica el punto inicial del mapa.
        </div>
        <div className="text-intervee-text-soft text-xs">
          Guardado: {saveStatus}
        </div>
        <button
          className="bg-intervee-connect hover:bg-intervee-connect-hover border-b-4 border-blue-900 px-3 py-2 text-sm font-semibold text-white uppercase transition"
          onClick={onSave}
          type="button"
        >
          Guardar JSON ahora
        </button>

        {WORLD_EDITOR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="text-intervee-text-soft text-xs font-semibold tracking-[0.2em] uppercase">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.assets.map((asset) => (
                <button
                  className={`border px-2 py-2 text-left text-xs font-semibold uppercase ${
                    activeAsset === asset
                      ? "border-intervee-border bg-intervee-page-soft text-intervee-primary"
                      : "border-white/15 bg-black/20 text-white"
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

      <aside className="border-intervee-border bg-intervee-surface absolute top-4 right-4 z-10 flex w-[19rem] flex-col gap-3 border-2 p-4 text-white shadow-md">
        <div className="text-intervee-text-soft text-sm font-semibold tracking-[0.2em] uppercase">
          Seleccion
        </div>
        {selectedItem ? (
          <>
            <div className="text-sm text-white">{selectedItem.asset}</div>
            <label className="text-intervee-text-soft text-xs">
              X
              <input
                className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
                onChange={(event) =>
                  onUpdateSelectedItem("x", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[0]}
              />
            </label>
            <label className="text-intervee-text-soft text-xs">
              Y
              <input
                className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
                onChange={(event) =>
                  onUpdateSelectedItem("y", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[1]}
              />
            </label>
            <label className="text-intervee-text-soft text-xs">
              Z
              <input
                className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
                onChange={(event) =>
                  onUpdateSelectedItem("z", Number(event.target.value))
                }
                type="number"
                value={selectedItem.position[2]}
              />
            </label>
            {selectedItem.asset === "billboard_16_9" ? (
              <label className="text-intervee-text-soft text-xs">
                Imagen
                <select
                  className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Empresa
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Slug
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Ruta
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Documento
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Logo
                  <select
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Radio de activacion
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-gray-900"
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
                <label className="text-intervee-text-soft text-xs">
                  Color
                  <input
                    className="bg-intervee-page border-intervee-border mt-1 h-10 w-full border px-2 py-2"
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
                className="border border-white/15 bg-black/20 px-3 py-2 text-sm font-semibold text-white uppercase"
                onClick={() => onNudgeRotation(-Math.PI / 2)}
                type="button"
              >
                Rotar -90
              </button>
              <button
                className="border border-white/15 bg-black/20 px-3 py-2 text-sm font-semibold text-white uppercase"
                onClick={() => onNudgeRotation(Math.PI / 2)}
                type="button"
              >
                Rotar +90
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="bg-intervee-connect hover:bg-intervee-connect-hover border-b-4 border-blue-900 px-3 py-2 text-sm font-semibold text-white uppercase transition"
                onClick={onDuplicateSelected}
                type="button"
              >
                Duplicar
              </button>
              <button
                className="bg-intervee-news border-intervee-border border-b-4 px-3 py-2 text-sm font-semibold text-white uppercase"
                onClick={onDeleteSelected}
                type="button"
              >
                Eliminar
              </button>
            </div>
          </>
        ) : (
          <div className="text-intervee-text-soft text-sm">
            Selecciona un objeto en la escena.
          </div>
        )}
      </aside>
    </>
  );
}
