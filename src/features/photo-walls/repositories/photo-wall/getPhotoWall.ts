import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Get Photo Wall
========================================================================== */

export async function getPhotoWall(
  photoWallId:
    string
): Promise<PhotoWall | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "photo_walls"
      )
      .select(
        "*"
      )
      .eq(
        "id",
        photoWallId
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "getPhotoWall error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}