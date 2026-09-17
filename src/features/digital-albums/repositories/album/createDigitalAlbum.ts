import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateDigitalAlbumInput,
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Create Digital Album
========================================================================== */

export async function createDigitalAlbum(
  input:
    CreateDigitalAlbumInput
): Promise<DigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_digital_album",
      {
        p_photo_wall_id:
          input.photoWallId,

        p_name:
          input.name,
      }
    );

  if (error) {
    console.error(
      "createDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Digitalni album nije kreiran."
    );
  }

  return data;
}