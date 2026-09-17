import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeleteDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Delete Digital Album
========================================================================== */

export async function deleteDigitalAlbum(
  input:
    DeleteDigitalAlbumInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_digital_album",
      {
        p_album_id:
          input.albumId,
      }
    );

  if (error) {
    console.error(
      "deleteDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}