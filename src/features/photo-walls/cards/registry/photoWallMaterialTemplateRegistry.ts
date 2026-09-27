import GardenGraceMaterialCard from "../templates/wedding/garden-grace/photo-wall/GardenGraceMaterialCard";
import MinimalMaterialCard from "../templates/minimal/MinimalMaterialCard";
import { photoWallMaterialTemplateConfigs } from "./photoWallMaterialTemplateConfigs";
import type { PhotoWallMaterialTemplateDefinition } from "../../types/photoWallMaterialTemplate.types";

const templates: Record<string, PhotoWallMaterialTemplateDefinition> = {
  "garden-grace": { config: photoWallMaterialTemplateConfigs["garden-grace"], component: GardenGraceMaterialCard },
  minimal: { config: photoWallMaterialTemplateConfigs.minimal, component: MinimalMaterialCard },
};
export function getPhotoWallMaterialTemplate(id: string) {
  return Object.hasOwn(templates, id) ? templates[id] : null;
}
