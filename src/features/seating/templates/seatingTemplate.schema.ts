import {seatingGeometryFits} from "../validation/seatingGeometry";
import { z } from "zod";
const table = z.object({
    name: z.string().trim().min(1).max(150), shape: z.enum(["round", "rectangle"]), capacity: z.number().int().min(1).max(100),
    x_cm: z.number().int().min(0).max(100000), y_cm: z.number().int().min(0).max(100000),
    width_cm: z.number().int().min(10).max(10000), height_cm: z.number().int().min(10).max(10000), rotation_deg: z.number().int().min(0).max(359),
}).strict().refine(t => t.shape !== "round" || t.width_cm === t.height_cm);
export const seatingTemplateDocumentSchema = z.object({ width_cm: z.number().int().min(100).max(100000), height_cm: z.number().int().min(100).max(100000), tables: z.array(table).max(200) }).strict().refine(d => d.tables.every(t => seatingGeometryFits(t,d.width_cm,d.height_cm)));
export type SeatingTemplateDocument = z.infer<typeof seatingTemplateDocumentSchema>;
export const seatingTemplateSchema = z.object({ id: z.string().uuid(), name: z.string().min(1).max(150), slug: z.string(), description: z.string().nullable(), document: seatingTemplateDocumentSchema, document_version: z.literal(1), is_active: z.boolean(), sort_order: z.number().int().nonnegative(), event_type: z.enum(["wedding", "birthday", "baptism", "communion", "confirmation", "business", "other"]).nullable(), created_at: z.string(), updated_at: z.string() });
