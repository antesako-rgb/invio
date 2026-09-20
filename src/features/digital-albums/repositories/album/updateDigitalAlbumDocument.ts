import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  DigitalAlbum,
  UpdateDigitalAlbumDocumentInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Update Digital Album Document
========================================================================== */

export async function updateDigitalAlbumDocument(
  input:
    UpdateDigitalAlbumDocumentInput
): Promise<DigitalAlbum> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_digital_album_document",
      {
        p_album_id:
          input.albumId,

        p_document:
          input.document as unknown as Json,

        p_document_version:
          input.documentVersion,
      }
    );

  if (
    error
  ) {
    console.error(
      "updateDigitalAlbumDocument error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (
    !data
  ) {
    throw new Error(
      "Dokument digitalnog albuma nije spremljen."
    );
  }

  return data;
}