import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Get Digital Album Photos
========================================================================== */

export async function getDigitalAlbumPhotos(
  albumId:
    string
): Promise<DigitalAlbumPhotoWithPhoto[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "digital_album_photos"
      )
      .select(`
        *,
        photo:event_photos!digital_album_photos_photo_id_fkey (
          *
        )
      `)
      .eq(
        "album_id",
        albumId
      )
      .order(
        "position",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    console.error(
      "getDigitalAlbumPhotos error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}