import { z } from "zod";
import { isMaterialDate } from "../renderer/display/buildPhotoWallMaterialDateDisplay";

const text = (max: number) => z.string().max(max).nullable();
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const element = z.object({
  font_family: z.string().max(120).optional(),
  font_scale: z.number().finite().min(0.5).max(2).optional(),
  color: color.optional(),
  font_style: z.enum(["normal", "italic"]).optional(),
  font_weight: z.number().int().min(100).max(900).optional(),
  text_align: z.enum(["left", "center", "right"]).optional(),
}).strict();

export const photoWallMaterialDraftSchema = z.object({
  name: z.string().trim().min(1).max(100),
  templateId: z.string().min(1).max(80),
  variantId: z.string().min(1).max(80),
  content: z.object({
    hero: z.object({
      title: text(90), subtitle: text(110),
      primary_name: text(65), secondary_name: text(65),
      first_initial: text(3), second_initial: text(3),
    }).strict(),
    description: text(240),
    date: z.object({ start_date: z.string().refine(isMaterialDate).nullable() }).strict(),
    time: z.object({ start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).nullable() }).strict(),
    location: z.object({ name: text(100), address: text(160) }).strict(),
  }).strict(),
  presentation: z.object({
    elements: z.record(z.string().max(80), element).refine(value => Object.keys(value).length <= 30).optional(),
    layout: z.object({
      background: z.object({
        color: color.optional(),
        image_url: z.string().max(2048).nullable().optional(),
        opacity: z.number().min(0).max(1).optional(),
      }).strict().optional(),
    }).strict().optional(),
  }).strict(),
}).strict();

export const updatePhotoWallMaterialSchema = z.object({
  materialId: z.string().uuid(),
  expectedUpdatedAt: z.string().datetime({ offset: true }),
  draft: photoWallMaterialDraftSchema,
}).strict();

export type PhotoWallMaterialDraft = z.infer<typeof photoWallMaterialDraftSchema>;
export type UpdatePhotoWallMaterialInput = z.infer<typeof updatePhotoWallMaterialSchema>;
