import {
  createServerClient,
} from "@/lib/supabase/server";
import { z } from "zod";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

import type {
  GetPublicDigitalAlbumInput,
  PublicDigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";

// The generated RPC return type is Json, not a typed table row.
// Validate the fields consumed by the public renderer at this boundary.
const publicAlbumSchema = z.object({
  album: z.object({
    public_id: z.string().min(1),
    name: z.string(),
    published_at: z.string().nullable(),
    document: z.unknown().transform(parseDigitalAlbumDocument),
    document_version: z.number().int().nonnegative(),
  }),
  photos: z.array(z.object({
    id: z.string().min(1),
    image_path: z.string().min(1),
    description: z.string().nullable(),
  })),
});

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

  return publicAlbumSchema.parse(data);
}
