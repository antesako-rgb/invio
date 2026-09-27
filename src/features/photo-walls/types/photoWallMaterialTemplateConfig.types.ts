import type { PhotoWallMaterialVariantId } from "../config/photoWallMaterialVariants";
import type { PhotoWallMaterialField } from "../content/photoWallMaterialFields";
import type { PhotoWallMaterialType } from "./photoWallMaterial.types";

export interface PhotoWallMaterialTemplateVariantConfig { id: PhotoWallMaterialVariantId }
export interface PhotoWallMaterialTemplateCardConfig {
  aspectRatio: `${number} / ${number}`;
  widthMm: number;
  heightMm: number;
}
export interface PhotoWallMaterialTemplateConfig {
  materialType: PhotoWallMaterialType;
  card: PhotoWallMaterialTemplateCardConfig;
  defaultVariantId: PhotoWallMaterialVariantId;
  variants: readonly PhotoWallMaterialTemplateVariantConfig[];
  fields: readonly PhotoWallMaterialField[];
  // Templates opt into a small, controlled set of existing presentation options.
  titleStyle: boolean;
}
