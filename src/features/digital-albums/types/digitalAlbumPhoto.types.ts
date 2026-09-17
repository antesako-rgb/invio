import type {
  Tables,
} from "@/lib/supabase/database.types";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Digital Album Photo
========================================================================== */

export type DigitalAlbumPhoto =
  Tables<"digital_album_photos">;


/* ==========================================================================
   Digital Album Photo With Photo
========================================================================== */

export type DigitalAlbumPhotoWithPhoto =
  DigitalAlbumPhoto & {
    photo:
      PhotoWallPhoto;
  };


/* ==========================================================================
   Add Digital Album Photos Input
========================================================================== */

export interface AddDigitalAlbumPhotosInput {
  albumId:
    string;

  photoIds:
    string[];
}


/* ==========================================================================
   Remove Digital Album Photo Input
========================================================================== */

export interface RemoveDigitalAlbumPhotoInput {
  albumId:
    string;

  photoId:
    string;
}


/* ==========================================================================
   Reorder Digital Album Photos Input
========================================================================== */

export interface ReorderDigitalAlbumPhotosInput {
  albumId:
    string;

  photoIds:
    string[];
}


/* ==========================================================================
   Public Digital Album Photo
========================================================================== */

export interface PublicDigitalAlbumPhoto {
  id:
    string;

  image_path:
    string;

  description:
    string | null;

  position:
    number;
}