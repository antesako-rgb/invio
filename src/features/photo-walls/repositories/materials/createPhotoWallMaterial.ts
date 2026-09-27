import "server-only";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/config";
import { getEvent } from "@/features/events/repositories/getEvent";
import { requirePhotoWallMaterialOwner } from "./requirePhotoWallMaterialOwner";
import { getPhotoWallMaterialVariantConfig, getPhotoWallMaterialTemplateConfig } from "../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import { createInitialPhotoWallMaterialContent } from "../../content/createInitialPhotoWallMaterialContent";
import { photoWallMaterialDraftSchema } from "../../validation/photoWallMaterial.schema";

const schema = z.object({
  photoWallId: z.string().uuid(), templateId: z.string().max(80),
  variantId: z.string().max(80), locale: z.enum(locales),
}).strict();
export type CreatePhotoWallMaterialInput = z.infer<typeof schema>;

export async function createPhotoWallMaterial(input: CreatePhotoWallMaterialInput) {
  const value = schema.parse(input);
  const config = getPhotoWallMaterialTemplateConfig(value.templateId);
  if (!config || !getPhotoWallMaterialVariantConfig(value.templateId, value.variantId)) throw new Error("INVALID_TEMPLATE");
  const { supabase, wall } = await requirePhotoWallMaterialOwner(value.photoWallId);
  const event = await getEvent(wall.event_id);
  if (!event) throw new Error("UNAUTHORIZED");
  const t = await getTranslations({ locale: value.locale, namespace: "PhotoWallMaterialContent.wedding" });
  const templates = await getTranslations({ locale: value.locale, namespace: "PhotoWallMaterialTemplates" });
  const draft = photoWallMaterialDraftSchema.parse({
    name: templates(`templates.${value.templateId}.name`),
    templateId: value.templateId, variantId: value.variantId,
    content: createInitialPhotoWallMaterialContent(event, {
      primaryName: event.name.slice(0, 65), secondaryName: null, heroTitle: t("heroTitle"),
      heroSubtitle: t("heroSubtitle") || null, firstInitial: null, secondInitial: null, description: t("description"),
    }),
    presentation: {},
  });
  const { data, error } = await supabase.from("photo_wall_materials").insert({
    photo_wall_id: wall.id, type: config.materialType, name: draft.name,
    template_id: draft.templateId, variant_id: draft.variantId,
    content: draft.content, presentation: draft.presentation,
  }).select("*").single();
  if (error) throw error;
  return data;
}
