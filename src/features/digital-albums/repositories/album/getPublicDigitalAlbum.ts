import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPublicDigitalAlbumInput,
  PublicDigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Get Public Digital Album
========================================================================== */

export async function getPublicDigitalAlbum(
  input:
    GetPublicDigitalAlbumInput
): Promise<PublicDigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_digital_album",
      {
        p_public_id:
          input.publicId,

        ...(input.limit !== undefined
          ? {
              p_limit:
                input.limit,
            }
          : {}),

        ...(input.cursorPosition !== undefined
          ? {
              p_cursor_position:
                input.cursorPosition,
            }
          : {}),
      }
    );

  if (error) {
    console.error(
      "getPublicDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (
    !data
    || typeof data !==
      "object"
    || Array.isArray(
      data
    )
  ) {
    throw new Error(
      "Digitalni album nije pronađen."
    );
  }

  return data as unknown as PublicDigitalAlbum;
}