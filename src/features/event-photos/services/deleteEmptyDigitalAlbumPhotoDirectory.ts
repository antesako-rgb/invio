import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteDirectoryFromBunny,
} from "@/lib/upload/bunny";


/* ==========================================================================
   Delete Empty Digital Album Photo Directory
========================================================================== */

export async function deleteEmptyDigitalAlbumPhotoDirectory(
  albumId:
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
        "event_photos"
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
        "digital-album"
      )
      .eq(
        "source_id",
        albumId
      );

  if (
    error
  ) {
    console.error(
      "deleteEmptyDigitalAlbumPhotoDirectory usage error:",
      error
    );

    throw new Error(
      "Fotografije digitalnog albuma nije moguće provjeriti."
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
    `digital-albums/${albumId}`
  );
}