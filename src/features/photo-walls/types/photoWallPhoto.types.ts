import type {
  Database,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Photo Wall Photo Association
========================================================================== */

export type PhotoWallPhotoAssociation =
  Database["public"]["Tables"]["photo_wall_photos"]["Row"];


/* ==========================================================================
   Photo Wall Photo
========================================================================== */

export interface PhotoWallPhoto {
  id:
    string;

  photoWallId:
    string;

  imagePath:
    string;

  fileSize:
    number;

  description:
    string | null;

  isFavorite:
    boolean;

  createdAt:
    string;
}


/* ==========================================================================
   Create Photo Wall Photo Input
========================================================================== */

export interface CreatePhotoWallPhotoInput {
  photoWallId:
    string;

  imagePath:
    string;

  fileSize:
    number;

  description:
    string | null;
}


/* ==========================================================================
   Upload Photo Wall Photo Input
========================================================================== */

export interface UploadPhotoWallPhotoInput {
  publicId:
    string;

  file:
    File;

  description:
    string | null;
}


/* ==========================================================================
   Delete Photo Wall Photo Input
========================================================================== */

export interface DeletePhotoWallPhotoInput {
  photoWallId:
    string;

  photoId:
    string;
}


/* ==========================================================================
   Photo Wall Photos Management Filter
========================================================================== */

export type PhotoWallPhotosManagementFilter =
  | "all"
  | "favorites";


/* ==========================================================================
   Photo Wall Photos Cursor
========================================================================== */

export interface PhotoWallPhotosCursor {
  createdAt:
    string;

  id:
    string;
}


/* ==========================================================================
   Get Photo Wall Photos Page Input
========================================================================== */

export interface GetPhotoWallPhotosPageInput {
  photoWallId:
    string;

  filter?:
    PhotoWallPhotosManagementFilter;

  cursor?:
    PhotoWallPhotosCursor | null;

  excludedPhotoIds?:
    string[];
}


/* ==========================================================================
   Photo Wall Photos Page
========================================================================== */

export interface PhotoWallPhotosPage {
  photos:
    PhotoWallPhoto[];

  nextCursor:
    PhotoWallPhotosCursor | null;

  totalCount:
    number;

  favoriteCount:
    number;
}


/* ==========================================================================
   Photo Wall Gallery Photo
========================================================================== */

export interface PhotoWallGalleryPhoto {
  id:
    string;

  imageUrl:
    string;

  alt:
    string;

  width:
    number;

  height:
    number;

  description:
    string | null;
}


/* ==========================================================================
   Get Public Photo Wall Photos Input
========================================================================== */

export type GetPublicPhotoWallPhotosInput =
  Database["public"]["Functions"]["get_public_photo_wall_photos"]["Args"];


/* ==========================================================================
   Public Photo Wall Photo
========================================================================== */

export type PublicPhotoWallPhoto =
  Database["public"]["Functions"]["get_public_photo_wall_photos"]["Returns"][number];


/* ==========================================================================
   Public Photo Wall Photos Page
========================================================================== */

export interface PublicPhotoWallPhotosPage {
  photos:
    PublicPhotoWallPhoto[];

  nextCursor:
    PhotoWallPhotosCursor | null;
}


/* ==========================================================================
   Photo Wall Render Photo
========================================================================== */

export interface PhotoWallRenderPhoto {
  id:
    string;

  image_path:
    string;

  file_size:
    number;

  description:
    string | null;

  created_at:
    string;
}