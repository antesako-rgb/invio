import { photoWallMaterialTemplateConfigs } from "./photoWallMaterialTemplateConfigs";
import type { PhotoWallMaterialTemplateConfig } from "../../types/photoWallMaterialTemplateConfig.types";

export interface PhotoWallMaterialTemplateEntry { id: string; config: PhotoWallMaterialTemplateConfig }
export function getPhotoWallMaterialTemplateConfig(id: string) {
  return Object.hasOwn(photoWallMaterialTemplateConfigs, id) ? photoWallMaterialTemplateConfigs[id] : null;
}
export function getAllPhotoWallMaterialTemplates(): PhotoWallMaterialTemplateEntry[] {
  return Object.entries(photoWallMaterialTemplateConfigs).map(([id, config]) => ({ id, config }));
}
export function getPhotoWallMaterialVariantConfig(templateId: string, variantId: string) {
  return getPhotoWallMaterialTemplateConfig(templateId)?.variants.find(variant => variant.id === variantId) ?? null;
}
