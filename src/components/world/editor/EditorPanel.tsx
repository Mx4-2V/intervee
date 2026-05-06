"use client";

import {
  BILLBOARD_IMAGE_OPTIONS,
  COMPANY_PORTAL_LOGO_OPTIONS,
  WORLD_EDITOR_GROUPS,
  type CompanyPortalConfig,
  type WorldItem,
} from "~/lib/world-layout";

import type { SaveStatus } from "~/components/world/shared/types";
import { Button } from "~/components/ui";
import { Input } from "~/components/ui";
import { PanelCard } from "~/components/ui";
import { SectionLabel } from "~/components/ui";

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
      <PanelCard className="absolute top-4 left-4 z-10 max-h-[calc(100vh-2rem)] w-[19rem] overflow-y-auto" padding="sm">
        <SectionLabel tracking="wide">Editor</SectionLabel>
        <div className="text-intervee-text-soft text-xs">
          Elige un asset y haz click en el suelo para colocarlo. El marcador
          azul indica el punto inicial del mapa.
        </div>
        <div className="text-intervee-text-soft text-xs">
          Guardado: {saveStatus}
        </div>
        <Button onClick={onSave} size="sm" type="button">
          Guardar JSON ahora
        </Button>

        {WORLD_EDITOR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <SectionLabel size="sm" tracking="wide">{group.label}</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {group.assets.map((asset) => (
                <button
                  className={`border px-2 py-2 text-left text-xs font-semibold uppercase ${
                    activeAsset === asset
                      ? "border-intervee-border bg-intervee-page-soft text-intervee-primary"
                      : "border-intervee-card-border bg-intervee-news/20 text-white"
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
      </PanelCard>

      <PanelCard className="absolute top-4 right-4 z-10 w-[19rem]" padding="sm">
        <SectionLabel tracking="wide">Seleccion</SectionLabel>
        {selectedItem ? (
          <>
            <div className="text-sm text-white">{selectedItem.asset}</div>
            <Input
              label="X"
              onChange={(event) =>
                onUpdateSelectedItem("x", Number(event.target.value))
              }
              type="number"
              value={selectedItem.position[0]}
            />
            <Input
              label="Y"
              onChange={(event) =>
                onUpdateSelectedItem("y", Number(event.target.value))
              }
              type="number"
              value={selectedItem.position[1]}
            />
            <Input
              label="Z"
              onChange={(event) =>
                onUpdateSelectedItem("z", Number(event.target.value))
              }
              type="number"
              value={selectedItem.position[2]}
            />
            {selectedItem.asset === "billboard_16_9" ? (
              <label className="text-intervee-text-soft text-xs">
                Imagen
                <select
                  className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-intervee-ink"
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
                <Input
                  label="Empresa"
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
                <Input
                  label="Slug"
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
                <Input
                  label="Ruta"
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
                <Input
                  label="Documento"
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
                <label className="text-intervee-text-soft text-xs">
                  Logo
                  <select
                    className="bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-intervee-ink"
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
                <Input
                  label="Radio de activacion"
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
              <Button
                onClick={() => onNudgeRotation(-Math.PI / 2)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Rotar -90
              </Button>
              <Button
                onClick={() => onNudgeRotation(Math.PI / 2)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Rotar +90
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onDuplicateSelected}
                size="sm"
                type="button"
              >
                Duplicar
              </Button>
              <Button
                onClick={onDeleteSelected}
                size="sm"
                type="button"
                variant="danger"
              >
                Eliminar
              </Button>
            </div>
          </>
        ) : (
          <div className="text-intervee-text-soft text-sm">
            Selecciona un objeto en la escena.
          </div>
        )}
      </PanelCard>
    </>
  );
}