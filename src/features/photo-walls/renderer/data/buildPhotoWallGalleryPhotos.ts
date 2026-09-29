import {
  getProjectPhotoUrl,
} from "@/features/project-photos/utils/getProjectPhotoUrl";

import type {
  PhotoWallRenderPhoto,
} from "@/features/photo-walls/types/photoWallPhoto.types";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhoto,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_PHOTO_WIDTH =
  1200;

const DEFAULT_PHOTO_HEIGHT =
  1200;


/* ==========================================================================
   Types
========================================================================== */

type PhotoWallGallerySourcePhoto =
  | PhotoWallRenderPhoto
  | PhotoWallPhoto;


/* ==========================================================================
   Build Photo Wall Gallery Photos
========================================================================== */

export function buildPhotoWallGalleryPhotos(
  photos:
    PhotoWallGallerySourcePhoto[]
): PhotoWallGalleryPhoto[] {
  return photos.map(
    (photo) => {
      const imagePath =
        "imagePath" in photo
          ? photo.imagePath
          : photo.image_path;

      return {
        id:
          photo.id,

        imageUrl:
          getProjectPhotoUrl(
            imagePath
          ),

        alt:
          "",

        width:
          DEFAULT_PHOTO_WIDTH,

        height:
          DEFAULT_PHOTO_HEIGHT,

        description:
          photo.description,
      };
    }
  );
}