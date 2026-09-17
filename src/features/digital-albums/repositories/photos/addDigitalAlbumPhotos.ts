import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  AddDigitalAlbumPhotosInput,
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Add Digital Album Photos
========================================================================== */

export async function addDigitalAlbumPhotos(
  input:
    AddDigitalAlbumPhotosInput
): Promise<DigitalAlbumPhoto[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "add_digital_album_photos",
      {
        p_album_id:
          input.albumId,

        p_photo_ids:
          input.photoIds,
      }
    );

  if (error) {
    console.error(
      "addDigitalAlbumPhotos error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}