import { z } from "zod";
import { FLOOR_STYLES, ROOM_STYLES } from "./model";

export const TABLE_THEMES = ["generic", "classic_ivory", "rustic_green", "modern_white", "elegant_gold"] as const;
export type TableTheme = typeof TABLE_THEMES[number];
export const presetRoomSchema = z.object({
  floor_style: z.enum(ROOM_STYLES).default("neutral"),
  table_theme: z.enum(TABLE_THEMES).default("generic"),
}).strict();
// A patch must preserve the other room property. Do not add defaults to RPC patches.
export const presetRoomPatchSchema = z.object({
  floor_style: z.enum(ROOM_STYLES).optional(), table_theme: z.enum(TABLE_THEMES).optional(),
}).strict();
export const presetTableThemeSchema = z.object({ table_theme: z.enum(TABLE_THEMES).default("generic") }).strict();
export const presetFloorSchema = z.object({ style: z.enum(FLOOR_STYLES).default("classic_parquet") }).strict();
export function normalizePreset(target: "room" | "table_theme" | "dance_floor" | "stage" | "dj_booth", value: unknown) {
  return (target === "room" ? presetRoomSchema : target === "table_theme" ? presetTableThemeSchema : target === "dance_floor" ? presetFloorSchema : z.object({}).strict()).parse(value);
}
export const presetActionSchema = z.object({
  planId: z.string().uuid(), revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1),
  target: z.enum(["room", "table_theme", "element"]), id: z.string().uuid().nullable(),
  appearance: z.record(z.string(), z.unknown()), all: z.literal(false).default(false),
}).strict().refine(v => v.target === "element" ? v.id !== null : v.id === null);

/** Only IDs are persisted. These coordinated visual tokens also drive card previews. */
export const TABLE_PRESETS = {
  generic: { surface: "#ffffff", rim: "#777575", chair: "#ffffff", frame: "#52525b", seam: "#777575", texture: "plain", decoration: "none", text: "#242424" },
  classic_ivory: { surface: "#f8f1e6", rim: "#c8b69b", chair: "#f6efe5", frame: "#b8a38a", seam: "#ded0bc", texture: "linen", decoration: "floral", text: "#423a34" },
  rustic_green: { surface: "#dbe1ce", rim: "#927455", chair: "#ced7bc", frame: "#876448", seam: "#a7b396", texture: "linen", decoration: "greenery", text: "#354236" },
  modern_white: { surface: "#fdfcf8", rim: "#b7b8b1", chair: "#fbfaf6", frame: "#919b98", seam: "#d9dcd5", texture: "satin", decoration: "floral", text: "#333c3b" },
  elegant_gold: { surface: "#f7efdc", rim: "#bb9858", chair: "#f9f2e5", frame: "#b49252", seam: "#dcc79f", texture: "satin", decoration: "candles", text: "#493d31" },
} as const;
export const FLOOR_PRESETS = {
  classic_parquet: { border: "#ad9671", shadow: 3 }, herringbone: { border: "#bc9a5d", shadow: 4 },
  dark_wood: { border: "#66503c", shadow: 4 }, white: { border: "#c5b89b", shadow: 2 },
  black_white: { border: "#9f8b65", shadow: 3 }, minimal: { border: "#c4b7a0", shadow: 2 },
} as const;
