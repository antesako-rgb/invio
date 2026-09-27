import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  deleteEmptyPhotoWallPhotoDirectory,
} from "@/features/event-photos/services/deleteEmptyPhotoWallPhotoDirectory";

import {
  deleteOrphanEventPhoto,
} from "@/features/event-photos/services/deleteOrphanEventPhoto";

import type {
  DeletePhotoWallPhotoInput,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Delete Photo Wall Photo
========================================================================== */

export async function deletePhotoWallPhoto(
  input:
    DeletePhotoWallPhotoInput
): Promise<void> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Get Photo
  ========================================================================== */

  const {
    data: photo,
    error: photoError,
  } =
    await supabase
      .from(
        "event_photos"
      )
      .select(
        "id, image_path"
      )
      .eq(
        "id",
        input.photoId
      )
      .maybeSingle();

  if (
    photoError
  ) {
    console.error(
      "deletePhotoWallPhoto get photo error:",
      photoError
    );

    throw new Error(
      "Fotografiju nije moguće učitati."
    );
  }

  if (
    !photo
  ) {
    throw new Error(
      "Fotografija nije pronađena."
    );
  }


  /* ==========================================================================
     Remove Photo Wall Association
  ========================================================================== */

  const {
    error,
  } =
    await supabase.rpc(
      "remove_photo_wall_photo",
      {
        p_photo_wall_id:
          input.photoWallId,

        p_photo_id:
          input.photoId,
      }
    );

  if (
    error
  ) {
    console.error(
      "deletePhotoWallPhoto error:",
      error
    );

    throw new Error(
      error.message
    );
  }


  /* ==========================================================================
     Delete Orphan Event Photo
  ========================================================================== */

  await deleteOrphanEventPhoto({
    photoId:
      input.photoId,

    imagePath:
      photo.image_path,
  });


  /* ==========================================================================
     Delete Empty Photo Wall Directory
  ========================================================================== */

  await deleteEmptyPhotoWallPhotoDirectory(
    input.photoWallId
  );
}