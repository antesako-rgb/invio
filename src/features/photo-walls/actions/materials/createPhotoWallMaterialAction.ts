"use server";

import { revalidatePath } from "next/cache";
import { createPhotoWallMaterial, type CreatePhotoWallMaterialInput } from "../../repositories/materials/createPhotoWallMaterial";

export async function createPhotoWallMaterialAction(input: CreatePhotoWallMaterialInput) {
  try {
    const material = await createPhotoWallMaterial(input);
    revalidatePath("/[locale]/dashboard/projects/[projectId]/photo-wall/materials", "page");
    return { success: true as const, materialId: material.id };
  } catch {
    return { success: false as const };
  }
}
