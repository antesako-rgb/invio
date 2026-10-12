import {seatingGeometryFits} from "../validation/seatingGeometry";
import { z } from "zod";
import { elementDocumentSchema, elementFits } from "../elements/model";
import { normalizePreset, presetRoomSchema } from "../appearance/presets";
const table = z.object({
    name: z.string().trim().min(1).max(150), shape: z.enum(["round", "rectangle"]), capacity: z.number().int().min(1).max(100),
    x_cm: z.number().int().min(0).max(100000), y_cm: z.number().int().min(0).max(100000),
    width_cm: z.number().int().min(10).max(10000), height_cm: z.number().int().min(10).max(10000), rotation_deg: z.number().int().min(0).max(359),
}).strict().refine(t => t.shape !== "round" || t.width_cm === t.height_cm);
const presetElement = elementDocumentSchema.innerType().extend({appearance:z.record(z.string(),z.unknown())}).strict().refine(e=>{
  try { normalizePreset(e.kind,e.appearance); return elementFits({...e,appearance:undefined},100000,100000); } catch { return false; }
});
export const presetTemplateDocumentSchema = z.object({width_cm:z.number().int().min(100).max(100000),height_cm:z.number().int().min(100).max(100000),appearance:presetRoomSchema,tables:z.array(table).max(200),elements:z.array(presetElement).max(200)}).strict()
  .refine(d=>d.tables.every(t=>seatingGeometryFits(t,d.width_cm,d.height_cm))&&d.elements.every(e=>elementFits({...e,appearance:undefined},d.width_cm,d.height_cm)));
// One current format; no legacy appearance fields or document adapters.
export const seatingTemplateDocumentSchema = presetTemplateDocumentSchema;
export type SeatingTemplateDocument = z.infer<typeof seatingTemplateDocumentSchema>;
const metadata = z.object({ id: z.string().uuid(), name: z.string().min(1).max(150), slug: z.string(), description: z.string().nullable(), is_active: z.boolean(), sort_order: z.number().int().nonnegative(), event_type: z.enum(["wedding", "birthday", "baptism", "communion", "confirmation", "business", "other"]).nullable(), created_at: z.string(), updated_at: z.string() });
// One current document format. DEV template inventory was empty before preparation.
export const seatingTemplateSchema=metadata.extend({document_version:z.literal(2),document:seatingTemplateDocumentSchema});
