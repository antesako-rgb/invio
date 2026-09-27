import type { PhotoWallMaterialTemplateConfig } from "../../../types/photoWallMaterialTemplateConfig.types";

export const minimalMaterialTemplateConfig: PhotoWallMaterialTemplateConfig = {
  materialType: "card",
  card: { aspectRatio: "2 / 3", widthMm: 100, heightMm: 150 },
  defaultVariantId: "sage",
  variants: [{ id: "champagne" }, { id: "sage" }, { id: "dusty-rose" }],
  fields: ["hero.title", "description", "hero.primary_name", "hero.secondary_name", "date.start_date", "time.start_time"],
  titleStyle: true,
};
