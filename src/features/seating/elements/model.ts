import { normalizePreset } from "../appearance/presets";
import { z } from "zod";
import { seatingGeometryFits } from "../validation/seatingGeometry";

export const ELEMENT_LIMITS = {
  dance_floor: { minWidth: 200, minHeight: 200, maxWidth: 2000, maxHeight: 2000, width: 400, height: 400 },
  stage: { minWidth: 200, minHeight: 120, maxWidth: 2000, maxHeight: 1200, width: 400, height: 240 },
  dj_booth: { minWidth: 120, minHeight: 60, maxWidth: 500, maxHeight: 300, width: 200, height: 100 },
} as const;
export const elementKindSchema = z.enum(["dance_floor", "stage", "dj_booth"]);
export type ElementKind = z.infer<typeof elementKindSchema>;
export const elementDocumentSchema = z.object({
  kind: elementKindSchema, name: z.string().trim().min(1).max(150),
  x_cm: z.number().int().min(0).max(100000), y_cm: z.number().int().min(0).max(100000),
  width_cm: z.number().int(), height_cm: z.number().int(), rotation_deg: z.number().int().min(0).max(359),
  z_index: z.number().int().min(0).max(10000), locked: z.boolean(), appearance: z.record(z.string(),z.union([z.string(),z.boolean(),z.null()])).optional(),
}).strict().refine(e => {
  if (e.appearance !== undefined) { try { normalizePreset(e.kind,e.appearance); } catch { return false; } }
  const b = ELEMENT_LIMITS[e.kind];
  return e.width_cm >= b.minWidth && e.width_cm <= b.maxWidth && e.height_cm >= b.minHeight && e.height_cm <= b.maxHeight;
});
export type ElementDocument = z.infer<typeof elementDocumentSchema>;
export type SeatingElement = ElementDocument & { id: string; project_id: string; plan_id: string };
export function elementFits(e: ElementDocument, width: number, height: number) {
  return elementDocumentSchema.safeParse(elementDocument(e)).success && seatingGeometryFits({ ...e, shape: "rectangle" }, width, height);
}
export function elementDocument(e: ElementDocument): ElementDocument {
  const { kind, name, x_cm, y_cm, width_cm, height_cm, rotation_deg, z_index, locked } = e;
  return { kind, name, x_cm, y_cm, width_cm, height_cm, rotation_deg, z_index, locked, ...(e.appearance !== undefined ? {appearance:e.appearance} : {}) };
}
export function elementGroup(kind: ElementKind) { return kind === "dance_floor" ? "floor" : "fixtures"; }
export function orderedElements(elements: readonly SeatingElement[], group: "floor" | "fixtures") {
  return elements.filter(e => elementGroup(e.kind) === group).sort((a, b) => a.z_index - b.z_index || a.id.localeCompare(b.id));
}
export function initialElement(kind: ElementKind, name: string, width: number, height: number): ElementDocument | null {
  const b = ELEMENT_LIMITS[kind];
  if (width < b.minWidth || height < b.minHeight) return null;
  return { kind, name, x_cm: Math.floor(width / 2), y_cm: Math.floor(height / 2),
    width_cm: Math.min(b.width, 2 * Math.floor(width / 2)), height_cm: Math.min(b.height, 2 * Math.floor(height / 2)), rotation_deg: 0, z_index: 0, locked: false };
}
export const elementActionSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("create"), planId: z.string().uuid(), revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1), element: elementDocumentSchema }).strict(),
  z.object({ operation: z.literal("update"), planId: z.string().uuid(), revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1), id: z.string().uuid(), element: elementDocumentSchema }).strict(),
  z.object({ operation: z.literal("delete"), planId: z.string().uuid(), revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1), id: z.string().uuid() }).strict(),
]);
