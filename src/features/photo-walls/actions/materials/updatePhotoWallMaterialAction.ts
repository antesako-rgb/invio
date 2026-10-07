"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ZodError,
} from "zod";

import {
  updatePhotoWallMaterial,
} from "../../repositories/materials/updatePhotoWallMaterial";

import type {
  UpdatePhotoWallMaterialInput,
} from "../../validation/photoWallMaterial.schema";

/* ==========================================================================
   Server Action
========================================================================== */

export async function updatePhotoWallMaterialAction(
  input:
    UpdatePhotoWallMaterialInput
) {
  try {
    const material = await updatePhotoWallMaterial(
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
        updatedAt:
          material.updated_at,
      },
    };
  } catch (error) {
    const code = error instanceof ZodError ? "VALIDATION"
      : error instanceof Error && error.message === "CONFLICT" ? "CONFLICT" : "SAVE_FAILED";
    return {
      success:
        false as const,

      code,
    };
  }
}
