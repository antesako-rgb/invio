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
     Get Photo Wall
  ========================================================================== */

  const {
    data: photoWall,
    error: photoWallError,
  } =
    await supabase
      .from(
        "invitations"
      )
      .select(
        "event_id"
      )
      .eq(
        "id",
        invitationId
      )
      .eq(
        "type",
        "photo-wall"
      )
      .single();

  if (
    photoWallError ||
    !photoWall
  ) {
    console.error(
      "createPhotoWallPhoto photo wall error:",
      photoWallError
    );

    throw new Error(
      "Photo Wall nije pronađen."
    );
  }


  /* ==========================================================================
     Create Event Photo
  ========================================================================== */

  const {
    data: eventPhoto,
    error: eventPhotoError,
  } =
    await supabase
      .from(
        "event_photos"
      )
      .insert({
        event_id:
          photoWall.event_id,

        image_path:
          imagePath,

        file_size:
          fileSize,

        source_type:
          "photo-wall",

        source_id:
          invitationId,
      })
      .select()
      .single();

  if (
    eventPhotoError ||
    !eventPhoto
  ) {
    console.error(
      "createPhotoWallPhoto event photo error:",
      eventPhotoError
    );

    throw new Error(
      "Fotografiju nije moguće spremiti."
    );
  }


  /* ==========================================================================
     Create Photo Wall Association
  ========================================================================== */

  const {
    data: association,
    error: associationError,
  } =
    await supabase
      .from(
        "photo_wall_photos"
      )
      .insert({
        photo_wall_id:
          invitationId,

        photo_id:
          eventPhoto.id,

        description:
          description,
      })
      .select()
      .single();

  if (
    associationError ||
    !association
  ) {
    console.error(
      "createPhotoWallPhoto association error:",
      associationError
    );


    /* ========================================================================
       Cleanup Event Photo
    ======================================================================== */

    const {
      error: cleanupError,
    } =
      await supabase
        .from(
          "event_photos"
        )
        .delete()
        .eq(
          "id",
          eventPhoto.id
        );

    if (
      cleanupError
    ) {
      console.error(
        "createPhotoWallPhoto cleanup error:",
        cleanupError
      );
    }

    throw new Error(
      "Fotografiju nije moguće povezati s Photo Wallom."
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    id:
      eventPhoto.id,

    photoWallId:
      association.photo_wall_id,

    imagePath:
      eventPhoto.image_path,

    fileSize:
      eventPhoto.file_size,

    description:
      association.description,

    isFavorite:
      association.is_favorite,

    createdAt:
      association.created_at,
  };
}