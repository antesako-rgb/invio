import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import {
  albumDocumentsEqual,
} from "@/features/digital-albums/utils/digitalAlbumDocumentOperations";

import {
  assertDigitalAlbumRevision,
  DigitalAlbumSaveConflict,
} from "@/features/digital-albums/utils/digitalAlbumRevision";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

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
  assertDigitalAlbumRevision(
    input.documentRevision
  );

  const document =
    parseDigitalAlbumDocument(
      input.document
    );


  /* ==========================================================================
     Supabase
  ========================================================================== */

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
          document as unknown as Json,

        p_document_version:
          input.documentVersion,

        p_expected_revision:
          input.documentRevision,
      }
    );


  /* ==========================================================================
     Error
  ========================================================================== */

  if (
    error
  ) {
    if (
      error.code === "PT409"
    ) {
      throw new DigitalAlbumSaveConflict();
    }

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
      "Digital album document was not saved."
    );
  }


  /* ==========================================================================
     Validate Saved Document
  ========================================================================== */

  assertDigitalAlbumRevision(
    data.document_revision
  );

  if (
    data.document_revision !==
    input.documentRevision + 1
  ) {
    throw new Error(
      "Unexpected album revision after save."
    );
  }

  const savedDocument =
    parseDigitalAlbumDocument(
      data.document
    );

  if (
    !albumDocumentsEqual(
      savedDocument,
      document
    )
  ) {
    throw new Error(
      "Saved album document does not match the requested document."
    );
  }

  return data;
}