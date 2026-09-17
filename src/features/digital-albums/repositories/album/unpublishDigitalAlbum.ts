import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbum,
  UnpublishDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Unpublish Digital Album
========================================================================== */

export async function unpublishDigitalAlbum(
  input:
    UnpublishDigitalAlbumInput
): Promise<DigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "unpublish_digital_album",
      {
        p_album_id:
          input.albumId,
      }
    );

  if (error) {
    console.error(
      "unpublishDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Objava digitalnog albuma nije uklonjena."
    );
  }

  return data;
}