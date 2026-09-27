import type {
  PhotoWallMaterialLocationContent,
} from "@/features/photo-walls/types/photoWallMaterialContent.types";

import type {
  PhotoWallMaterialLocationDisplay,
} from "@/features/photo-walls/types/photoWallMaterialRenderer.types";


/* ==========================================================================
   Build Photo Wall Material Location Display
========================================================================== */

export function buildPhotoWallMaterialLocationDisplay(
  location: PhotoWallMaterialLocationContent
): PhotoWallMaterialLocationDisplay {
  const venueName =
    location.name ?? "";

  const address =
    location.address ?? "";

  return {
    hasLocation:
      Boolean(
        venueName ||
        address
      ),

    venueName,

    address,
  };
}