import type { PhotoWallMaterialContent } from "../../types/photoWallMaterialContent.types";
import { buildPhotoWallMaterialDateDisplay } from "../display/buildPhotoWallMaterialDateDisplay";
import { buildPhotoWallMaterialTimeDisplay } from "../display/buildPhotoWallMaterialTimeDisplay";
import { buildPhotoWallMaterialLocationDisplay } from "../display/buildPhotoWallMaterialLocationDisplay";

export function buildPhotoWallMaterialDisplay(content: PhotoWallMaterialContent, locale: string) {
  return {
    date: buildPhotoWallMaterialDateDisplay(content.date, locale),
    time: buildPhotoWallMaterialTimeDisplay(content.time),
    location: buildPhotoWallMaterialLocationDisplay(content.location),
  };
}
