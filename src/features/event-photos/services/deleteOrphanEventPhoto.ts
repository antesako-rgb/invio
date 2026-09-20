import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteFromBunny,
} from "@/lib/upload/bunny";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteOrphanEventPhotoInput {
  photoId:
    string;

  imagePath:
    string;
}


/* ==========================================================================
   Delete Orphan Event Photo
========================================================================== */

export async function deleteOrphanEventPhoto({
  photoId,
  imagePath,
}: DeleteOrphanEventPhotoInput): Promise<void> {
  const admin =
    createAdminClient();


  /* ==========================================================================
     Check Photo Wall Usage
  ========================================================================== */

  const {
    count: photoWallUsageCount,
    error: photoWallUsageError,
  } =
    await admin
      .from(
        "photo_wall_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_id",
        photoId
      );

  if (
    photoWallUsageError
  ) {
    console.error(
      "deleteOrphanEventPhoto photo wall usage error:",
      photoWallUsageError
    );

    throw new Error(
      "Korištenje fotografije nije moguće provjeriti."
    );
  }


  /* ==========================================================================
     Check Digital Album Usage
  ========================================================================== */

  const {
    count: albumUsageCount,
    error: albumUsageError,
  } =
    await admin
      .from(
        "digital_album_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_id",
        photoId
      );

  if (
    albumUsageError
  ) {
    console.error(
      "deleteOrphanEventPhoto album usage error:",
      albumUsageError
    );

    throw new Error(
      "Korištenje fotografije nije moguće provjeriti."
    );
  }


  /* ==========================================================================
     Keep Shared Photo
  ========================================================================== */

  const isStillUsed =
    (photoWallUsageCount ?? 0) >
      0 ||
    (albumUsageCount ?? 0) >
      0;

  if (
    isStillUsed
  ) {
    return;
  }


  /* ==========================================================================
     Delete From Bunny
  ========================================================================== */

  await deleteFromBunny(
    imagePath
  );


  /* ==========================================================================
     Delete Event Photo
  ========================================================================== */

  const {
    error: deletePhotoError,
  } =
    await admin
      .from(
        "event_photos"
      )
      .delete()
      .eq(
        "id",
        photoId
      );

  if (
    deletePhotoError
  ) {
    console.error(
      "deleteOrphanEventPhoto event photo delete error:",
      deletePhotoError
    );

    throw new Error(
      "Fotografiju nije moguće obrisati."
    );
  }
}