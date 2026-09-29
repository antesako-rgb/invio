import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Get Project Photo Wall
========================================================================== */

export async function getProjectPhotoWall(
  projectId:
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
        "project_id",
        projectId
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "getProjectPhotoWall error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}