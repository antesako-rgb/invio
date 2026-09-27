import type { PhotoWallMaterialTemplateConfig } from "../../../../../types/photoWallMaterialTemplateConfig.types";

export const gardenGraceMaterialTemplateConfig: PhotoWallMaterialTemplateConfig = {
  materialType: "card",
  card: { aspectRatio: "5 / 6", widthMm: 125, heightMm: 150 },
  defaultVariantId: "champagne",
  variants: [{ id: "champagne" }, { id: "sage" }, { id: "dusty-rose" }],
  fields: ["hero.title", "description", "hero.subtitle", "hero.primary_name", "hero.secondary_name", "date.start_date"],
  titleStyle: true,
};
