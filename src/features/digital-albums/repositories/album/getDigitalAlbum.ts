import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import {
  assertDigitalAlbumRevision,
} from "@/features/digital-albums/utils/digitalAlbumRevision";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Get Digital Album
========================================================================== */

export async function getDigitalAlbum(
  albumId:
    string
): Promise<DigitalAlbum | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "digital_albums"
      )
      .select(
        "*"
      )
      .eq(
        "id",
        albumId
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "getDigitalAlbum error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (
    !data
  ) {
    return null;
  }

  assertDigitalAlbumRevision(
    data.document_revision
  );

  const document =
    parseDigitalAlbumDocument(
      data.document
    );

  return {
    ...data,

    document:
      document as unknown as Json,
  };
}