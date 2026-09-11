import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Photo Wall Photo
========================================================================== */

export type PhotoWallPhoto =
  Tables<"photo_wall_photos">;


/* ==========================================================================
   Create Photo Wall Photo Input
========================================================================== */

export interface CreatePhotoWallPhotoInput {
  invitationId:
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
  photoId:
    string;
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