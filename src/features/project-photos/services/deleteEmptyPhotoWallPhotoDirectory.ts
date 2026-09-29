import "server-only";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteDirectoryFromBunny,
} from "@/lib/upload/bunny";


/* ==========================================================================
   Delete Empty Photo Wall Photo Directory
========================================================================== */

export async function deleteEmptyPhotoWallPhotoDirectory(
  photoWallId:
    string
): Promise<void> {
  const admin =
    createAdminClient();


  /* ==========================================================================
     Check Direct Uploads
  ========================================================================== */

  const {
    count,
    error,
  } =
    await admin
      .from(
        "project_photos"
      )
      .select(
        "id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "source_type",
        "photo-wall"
      )
      .eq(
        "source_id",
        photoWallId
      );

  if (
    error || count === null
  ) {
    console.error(
      "deleteEmptyPhotoWallPhotoDirectory usage error:",
      error
    );

    throw new Error(
      "Fotografije Photo Walla nije moguće provjeriti."
    );
  }


  /* ==========================================================================
     Keep Directory
  ========================================================================== */

  if (
    (count ?? 0) >
    0
  ) {
    return;
  }


  /* ==========================================================================
     Delete Directory
  ========================================================================== */

  await deleteDirectoryFromBunny(
    `photo-wall/${photoWallId}`
  );
}