import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
  UpdatePhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Update Photo Wall
========================================================================== */

export async function updatePhotoWall(
  input:
    UpdatePhotoWallArgs
): Promise<PhotoWall> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_photo_wall",
      input
    );

  if (
    error
  ) {
    console.error(
      "updatePhotoWall error:",
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