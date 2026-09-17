import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbum,
  UpdateDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Update Digital Album
========================================================================== */

export async function updateDigitalAlbum(
  input:
    UpdateDigitalAlbumInput
): Promise<DigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_digital_album",
      {
        p_album_id:
          input.albumId,

        p_name:
          input.name,
      }
    );

  if (error) {
    console.error(
      "updateDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Digitalni album nije ažuriran."
    );
  }

  return data;
}