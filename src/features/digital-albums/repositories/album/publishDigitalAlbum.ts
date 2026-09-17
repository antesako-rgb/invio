import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbum,
  PublishDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Publish Digital Album
========================================================================== */

export async function publishDigitalAlbum(
  input:
    PublishDigitalAlbumInput
): Promise<DigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "publish_digital_album",
      {
        p_album_id:
          input.albumId,
      }
    );

  if (error) {
    console.error(
      "publishDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Digitalni album nije objavljen."
    );
  }

  return data;
}