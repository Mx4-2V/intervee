import { z } from "zod";

export type AssetCategory = "building" | "road" | "prop";

export type AssetDefinition = {
  category: AssetCategory;
  defaultY?: number;
  fitMode?: "xyz" | "xz";
  size: [number, number, number];
  solid?: boolean;
};

const BUILDING_SCALE = 1.5;

export const WORLD_ASSET_DEFINITIONS: Record<string, AssetDefinition> = {
  building_A_withoutBase: {
    category: "building",
    size: [4 * BUILDING_SCALE, 5.6 * BUILDING_SCALE, 4 * BUILDING_SCALE],
    solid: true,
  },
  building_B_withoutBase: {
    category: "building",
    size: [3.5 * BUILDING_SCALE, 3.6 * BUILDING_SCALE, 5 * BUILDING_SCALE],
    solid: true,
  },
  building_C_withoutBase: {
    category: "building",
    size: [4 * BUILDING_SCALE, 5 * BUILDING_SCALE, 4 * BUILDING_SCALE],
    solid: true,
  },
  building_D_withoutBase: {
    category: "building",
    size: [6 * BUILDING_SCALE, 4.4 * BUILDING_SCALE, 3.5 * BUILDING_SCALE],
    solid: true,
  },
  building_E_withoutBase: {
    category: "building",
    size: [4.5 * BUILDING_SCALE, 4 * BUILDING_SCALE, 4 * BUILDING_SCALE],
    solid: true,
  },
  building_F_withoutBase: {
    category: "building",
    size: [5 * BUILDING_SCALE, 6.2 * BUILDING_SCALE, 5 * BUILDING_SCALE],
    solid: true,
  },
  building_G_withoutBase: {
    category: "building",
    size: [5 * BUILDING_SCALE, 6.8 * BUILDING_SCALE, 4 * BUILDING_SCALE],
    solid: true,
  },
  building_H_withoutBase: {
    category: "building",
    size: [4.5 * BUILDING_SCALE, 8.2 * BUILDING_SCALE, 4.5 * BUILDING_SCALE],
    solid: true,
  },
  base: { category: "road", defaultY: 0.01, fitMode: "xz", size: [8, 0.25, 8] },
  road_corner: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [8, 0.25, 8],
  },
  road_corner_curved: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [8, 0.25, 8],
  },
  road_junction: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [8, 0.25, 8],
  },
  road_straight: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [10, 0.25, 8],
  },
  road_straight_crossing: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [8, 0.25, 8],
  },
  road_tsplit: {
    category: "road",
    defaultY: 0.01,
    fitMode: "xz",
    size: [8, 0.25, 8],
  },
  bench: { category: "prop", size: [2.8, 1.4, 1.3] },
  box_A: { category: "prop", size: [1.1, 1.1, 1.1] },
  box_B: { category: "prop", size: [1.1, 1.1, 1.1] },
  bush: { category: "prop", size: [1.8, 1.4, 1.8] },
  car_hatchback: { category: "prop", size: [3.4, 1.6, 1.9] },
  car_police: { category: "prop", size: [3.4, 1.6, 1.9] },
  car_sedan: { category: "prop", size: [3.4, 1.6, 1.9] },
  car_stationwagon: { category: "prop", size: [3.4, 1.6, 1.9] },
  car_taxi: { category: "prop", size: [3.4, 1.6, 1.9] },
  dumpster: { category: "prop", size: [2.2, 1.8, 1.5] },
  firehydrant: { category: "prop", size: [0.8, 1.1, 0.8] },
  streetlight: { category: "prop", size: [1.4, 4.8, 1.4] },
  trafficlight_A: { category: "prop", size: [1.2, 3.4, 1.2] },
  trafficlight_B: { category: "prop", size: [1.2, 3.4, 1.2] },
  trafficlight_C: { category: "prop", size: [1.2, 3.4, 1.2] },
  trash_A: { category: "prop", size: [0.8, 0.8, 0.8] },
  trash_B: { category: "prop", size: [0.8, 0.8, 0.8] },
  watertower: { category: "prop", size: [5.5, 10, 5.5] },
};

export const WORLD_EDITOR_GROUPS: Array<{
  assets: string[];
  label: string;
}> = [
  {
    label: "Buildings",
    assets: [
      "building_A_withoutBase",
      "building_B_withoutBase",
      "building_C_withoutBase",
      "building_D_withoutBase",
      "building_E_withoutBase",
      "building_F_withoutBase",
      "building_G_withoutBase",
      "building_H_withoutBase",
    ],
  },
  {
    label: "Roads",
    assets: [
      "road_straight",
      "road_corner",
      "road_corner_curved",
      "road_junction",
      "road_straight_crossing",
      "road_tsplit",
      "base",
    ],
  },
  {
    label: "Props",
    assets: [
      "bench",
      "bush",
      "streetlight",
      "trafficlight_A",
      "trafficlight_B",
      "trafficlight_C",
      "car_taxi",
      "car_police",
      "car_sedan",
      "car_hatchback",
      "car_stationwagon",
      "dumpster",
      "firehydrant",
      "trash_A",
      "trash_B",
      "box_A",
      "box_B",
      "watertower",
    ],
  },
];

export const worldAssetKeySchema = z.string().refine((value) => {
  return value in WORLD_ASSET_DEFINITIONS;
}, "Unknown world asset");

export const worldItemSchema = z.object({
  asset: worldAssetKeySchema,
  id: z.string().min(1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotationY: z.number().optional().default(0),
});

export const worldLayoutSchema = z.object({
  items: z.array(worldItemSchema),
});

export type WorldItem = z.infer<typeof worldItemSchema>;
export type WorldLayout = z.infer<typeof worldLayoutSchema>;

export function getWorldAssetDefinition(asset: string) {
  return WORLD_ASSET_DEFINITIONS[asset];
}
