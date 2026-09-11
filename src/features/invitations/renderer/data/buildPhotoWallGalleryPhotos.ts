import type {
  PhotoWallGalleryPhoto,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery";

import type {
  PhotoWallRenderPhoto,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_PHOTO_WIDTH =
  1200;

const DEFAULT_PHOTO_HEIGHT =
  1200;


/* ==========================================================================
   Build Photo Wall Gallery Photos
========================================================================== */

export function buildPhotoWallGalleryPhotos(
  photos:
    PhotoWallRenderPhoto[]
): PhotoWallGalleryPhoto[] {
  const cdnUrl =
    process.env
      .NEXT_PUBLIC_CDN_URL;

  if (
    !cdnUrl
  ) {
    throw new Error(
      "CDN URL nije konfiguriran."
    );
  }

  const normalizedCdnUrl =
    cdnUrl.replace(
      /\/+$/,
      ""
    );

  return photos.map(
    (photo) => ({
      id:
        photo.id,

      imageUrl:
        `${normalizedCdnUrl}/${photo.image_path}`,

      alt:
        "",

      width:
        DEFAULT_PHOTO_WIDTH,

      height:
        DEFAULT_PHOTO_HEIGHT,

      description:
        photo.description,
    })
  );
}