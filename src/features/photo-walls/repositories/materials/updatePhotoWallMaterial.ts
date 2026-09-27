import "server-only";
import { getPhotoWallMaterial } from "./getPhotoWallMaterial";
import { requirePhotoWallMaterialOwner } from "./requirePhotoWallMaterialOwner";
import { updatePhotoWallMaterialSchema, type UpdatePhotoWallMaterialInput } from "../../validation/photoWallMaterial.schema";
import { getPhotoWallMaterialVariantConfig } from "../../cards/registry/photoWallMaterialTemplateRegistry.utils";

export async function updatePhotoWallMaterial(input: UpdatePhotoWallMaterialInput) {
  const { materialId, expectedUpdatedAt, draft } = updatePhotoWallMaterialSchema.parse(input);
  if (!getPhotoWallMaterialVariantConfig(draft.templateId, draft.variantId)) throw new Error("INVALID_TEMPLATE");
  const material = await getPhotoWallMaterial(materialId);
  if (!material) throw new Error("UNAUTHORIZED");
  const { supabase } = await requirePhotoWallMaterialOwner(material.photo_wall_id);
  const updatedAt = new Date(Math.max(Date.now(), Date.parse(expectedUpdatedAt) + 1)).toISOString();
  const { data, error } = await supabase.from("photo_wall_materials").update({
    name: draft.name, template_id: draft.templateId, variant_id: draft.variantId,
    content: draft.content, presentation: draft.presentation, updated_at: updatedAt,
  }).eq("id", materialId).eq("photo_wall_id", material.photo_wall_id)
    .eq("updated_at", expectedUpdatedAt).select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("CONFLICT");
  return data;
}
