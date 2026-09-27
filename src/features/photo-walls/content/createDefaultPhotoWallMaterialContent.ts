import type { PhotoWallMaterialContent } from "../types/photoWallMaterialContent.types";

export function createDefaultPhotoWallMaterialContent(): PhotoWallMaterialContent {
  return {
    hero: { primary_name: null, secondary_name: null, title: null, subtitle: null, first_initial: null, second_initial: null },
    description: null,
    date: { start_date: null },
    time: { start_time: null },
    location: { name: null, address: null },
  };
}
