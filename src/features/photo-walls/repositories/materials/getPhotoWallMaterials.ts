import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWallMaterial,
} from "@/features/photo-walls/types/photoWallMaterial.types";


/* ==========================================================================
   Get Photo Wall Materials
========================================================================== */

export async function getPhotoWallMaterials(
  photoWallId:
    string
): Promise<PhotoWallMaterial[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "photo_wall_materials"
      )
      .select(
        "*"
      )
      .eq(
        "photo_wall_id",
        photoWallId
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    console.error(
      "getPhotoWallMaterials error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data ?? [];
}