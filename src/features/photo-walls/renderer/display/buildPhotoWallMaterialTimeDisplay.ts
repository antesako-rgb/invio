import type { PhotoWallMaterialTimeContent } from "../../types/photoWallMaterialContent.types";
import type { PhotoWallMaterialTimeDisplay } from "../../types/photoWallMaterialRenderer.types";

export function buildPhotoWallMaterialTimeDisplay(content: PhotoWallMaterialTimeContent): PhotoWallMaterialTimeDisplay {
  const value = content.start_time;
  const valid = value !== null && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
  return { hasTime: valid, text: valid ? value.slice(0, 5) : "" };
}
