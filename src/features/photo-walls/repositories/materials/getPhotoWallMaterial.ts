import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWallMaterial,
} from "@/features/photo-walls/types/photoWallMaterial.types";


/* ==========================================================================
   Get Photo Wall Material
========================================================================== */

export async function getPhotoWallMaterial(
  materialId:
    string
): Promise<PhotoWallMaterial | null> {
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
        "id",
        materialId
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "getPhotoWallMaterial error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}