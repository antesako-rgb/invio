import { gardenGraceMaterialTemplateConfig } from "../templates/wedding/garden-grace/photo-wall/GardenGraceMaterialTemplateConfig";
import { minimalMaterialTemplateConfig } from "../templates/minimal/MinimalMaterialTemplateConfig";
import type { PhotoWallMaterialTemplateConfig } from "../../types/photoWallMaterialTemplateConfig.types";

// Serializable metadata can be used by server validation without importing templates.
export const photoWallMaterialTemplateConfigs: Record<string, PhotoWallMaterialTemplateConfig> = {
  "garden-grace": gardenGraceMaterialTemplateConfig,
  minimal: minimalMaterialTemplateConfig,
};
