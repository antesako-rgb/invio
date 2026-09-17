import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Get Photo Wall Digital Albums
========================================================================== */

export async function getPhotoWallDigitalAlbums(
  photoWallId:
    string
): Promise<DigitalAlbum[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "digital_albums"
      )
      .select(
        "*"
      )
      .eq(
        "photo_wall_id",
        photoWallId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    console.error(
      "getPhotoWallDigitalAlbums error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}