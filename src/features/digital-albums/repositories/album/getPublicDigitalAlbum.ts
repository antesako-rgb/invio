import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

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
      }
    );

  if (
    error
  ) {
    console.error(
      "getPublicDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(
      data
    )
  ) {
    throw new Error(
      "Digital album not found."
    );
  }

  const result =
    data as unknown as PublicDigitalAlbum;

  result.album.document =
    parseDigitalAlbumDocument(
      result.album.document
    );

  return result;
}