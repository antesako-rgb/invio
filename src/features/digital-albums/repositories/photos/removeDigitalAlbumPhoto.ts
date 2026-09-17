import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  RemoveDigitalAlbumPhotoInput,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Remove Digital Album Photo
========================================================================== */

export async function removeDigitalAlbumPhoto(
  input:
    RemoveDigitalAlbumPhotoInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "remove_digital_album_photo",
      {
        p_album_id:
          input.albumId,

        p_photo_id:
          input.photoId,
      }
    );

  if (error) {
    console.error(
      "removeDigitalAlbumPhoto error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}