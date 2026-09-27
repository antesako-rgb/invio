import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
  PublishPhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Publish Photo Wall
========================================================================== */

export async function publishPhotoWall(
  input:
    PublishPhotoWallArgs
): Promise<PhotoWall> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "publish_photo_wall",
      input
    );

  if (
    error
  ) {
    console.error(
      "publishPhotoWall error:",
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