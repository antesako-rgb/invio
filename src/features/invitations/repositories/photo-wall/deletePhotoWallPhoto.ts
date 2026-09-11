import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteFromBunny,
} from "@/lib/upload/bunny";

import type {
  DeletePhotoWallPhotoInput,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Delete Photo Wall Photo
========================================================================== */

export async function deletePhotoWallPhoto({
  photoId,
}: DeletePhotoWallPhotoInput): Promise<void> {
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
      "photo_wall_photos"
    )
    .select(
      "id, invitation_id, image_path"
    )
    .eq(
      "id",
      photoId
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
      "Fotografiju nije moguće dohvatiti."
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
   Validate Bunny Path
========================================================================== */

const expectedPrefix =
  `photo-wall/${photo.invitation_id}/`;

if (
  !photo.image_path.startsWith(
    expectedPrefix
  )
) {
  throw new Error(
    "Putanja fotografije nije ispravna."
  );
}


  /* ==========================================================================
     Delete From Bunny
  ========================================================================== */

  await deleteFromBunny(
    photo.image_path
  );


  /* ==========================================================================
     Delete From Database
  ========================================================================== */

  const admin =
    createAdminClient();

  const {
    error: deleteError,
  } =
    await admin
      .from(
        "photo_wall_photos"
      )
      .delete()
      .eq(
        "id",
        photo.id
      );

  if (
    deleteError
  ) {
    console.error(
      "deletePhotoWallPhoto database error:",
      deleteError
    );

    throw new Error(
      "Fotografiju nije moguće obrisati."
    );
  }
}