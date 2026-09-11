import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  CreatePhotoWallPhotoInput,
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Create Photo Wall Photo
========================================================================== */

export async function createPhotoWallPhoto({
  invitationId,
  imagePath,
  fileSize,
  description,
}: CreatePhotoWallPhotoInput): Promise<PhotoWallPhoto> {
  const supabase =
    createAdminClient();


  /* ==========================================================================
     Create Photo
  ========================================================================== */

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "photo_wall_photos"
      )
      .insert({
        invitation_id:
          invitationId,

        image_path:
          imagePath,

        file_size:
          fileSize,

        description:
          description,
      })
      .select()
      .single();


  /* ==========================================================================
     Error
  ========================================================================== */

  if (
    error ||
    !data
  ) {
    console.error(
      "createPhotoWallPhoto error:",
      error
    );

    throw new Error(
      "Fotografiju nije moguće spremiti."
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return data;
}