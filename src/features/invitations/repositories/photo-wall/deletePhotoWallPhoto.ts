import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteEmptyPhotoWallPhotoDirectory,
} from "@/features/event-photos/services/deleteEmptyPhotoWallPhotoDirectory";

import {
  deleteOrphanEventPhoto,
} from "@/features/event-photos/services/deleteOrphanEventPhoto";

import type {
  DeletePhotoWallPhotoInput,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Delete Photo Wall Photo
========================================================================== */

export async function deletePhotoWallPhoto({
  invitationId,
  photoId,
}: DeletePhotoWallPhotoInput): Promise<void> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Get Photo Wall Association
  ========================================================================== */

  const {
    data: association,
    error: associationError,
  } =
    await supabase
      .from(
        "photo_wall_photos"
      )
      .select(`
        photo_wall_id,
        photo_id,
        photo:event_photos!photo_wall_photos_photo_id_fkey (
          id,
          image_path
        )
      `)
      .eq(
        "photo_wall_id",
        invitationId
      )
      .eq(
        "photo_id",
        photoId
      )
      .maybeSingle();

  if (
    associationError
  ) {
    console.error(
      "deletePhotoWallPhoto get association error:",
      associationError
    );

    throw new Error(
      "Fotografiju nije moguće dohvatiti."
    );
  }

  if (
    !association
  ) {
    throw new Error(
      "Fotografija nije pronađena."
    );
  }


  /* ==========================================================================
     Admin Client
  ========================================================================== */

  const admin =
    createAdminClient();


  /* ==========================================================================
     Delete Photo Wall Association
  ========================================================================== */

  const {
    error: deleteAssociationError,
  } =
    await admin
      .from(
        "photo_wall_photos"
      )
      .delete()
      .eq(
        "photo_wall_id",
        invitationId
      )
      .eq(
        "photo_id",
        photoId
      );

  if (
    deleteAssociationError
  ) {
    console.error(
      "deletePhotoWallPhoto association delete error:",
      deleteAssociationError
    );

    throw new Error(
      "Fotografiju nije moguće ukloniti iz Photo Walla."
    );
  }


  /* ==========================================================================
     Delete Orphan Event Photo
  ========================================================================== */

  await deleteOrphanEventPhoto({
    photoId,
    imagePath:
      association.photo.image_path,
  });


  /* ==========================================================================
     Delete Empty Photo Wall Directory
  ========================================================================== */

  await deleteEmptyPhotoWallPhotoDirectory(
    invitationId
  );
}