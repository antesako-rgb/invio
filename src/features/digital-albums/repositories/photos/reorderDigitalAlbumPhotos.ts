import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbumPhoto,
  ReorderDigitalAlbumPhotosInput,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Reorder Digital Album Photos
========================================================================== */

export async function reorderDigitalAlbumPhotos(
  input:
    ReorderDigitalAlbumPhotosInput
): Promise<DigitalAlbumPhoto[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "reorder_digital_album_photos",
      {
        p_album_id:
          input.albumId,

        p_photo_ids:
          input.photoIds,
      }
    );

  if (error) {
    console.error(
      "reorderDigitalAlbumPhotos error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}