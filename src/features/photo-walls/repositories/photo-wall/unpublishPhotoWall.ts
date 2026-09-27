import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
  UnpublishPhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Unpublish Photo Wall
========================================================================== */

export async function unpublishPhotoWall(
  input:
    UnpublishPhotoWallArgs
): Promise<PhotoWall> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "unpublish_photo_wall",
      input
    );

  if (
    error
  ) {
    console.error(
      "unpublishPhotoWall error:",
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
      "Photo Wall not returned."
    );
  }

  return data;
}