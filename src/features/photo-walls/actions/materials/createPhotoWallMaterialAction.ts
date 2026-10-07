"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createPhotoWallMaterial,
  type CreatePhotoWallMaterialInput,
} from "../../repositories/materials/createPhotoWallMaterial";

/* ==========================================================================
   Server Action
========================================================================== */

export async function createPhotoWallMaterialAction(
  input:
    CreatePhotoWallMaterialInput
) {
  try {
    const material = await createPhotoWallMaterial(
      input
    );
    revalidatePath(
      "/[locale]/dashboard/photo-walls/[photoWallId]/materials",
      "page"
    );
    return {
      success:
        true as const,

      data: {
        materialId:
          material.id,
      },
    };
  } catch {
    return {
      success:
        false as const,

      code:
        "MATERIAL_CREATE_FAILED" as const,
    };
  }
}
