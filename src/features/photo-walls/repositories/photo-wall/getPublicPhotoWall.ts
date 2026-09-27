import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PublicPhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Get Public Photo Wall
========================================================================== */

export async function getPublicPhotoWall(
  publicId:
    string
): Promise<PublicPhotoWall | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_photo_wall",
      {
        p_public_id:
          publicId,
      }
    );

  if (
    error
  ) {
    console.error(
      "getPublicPhotoWall error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data?.[0] ?? null;
}