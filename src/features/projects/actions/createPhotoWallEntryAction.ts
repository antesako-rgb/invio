"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProjectOwner } from "../repositories/requireProjectOwner";
import { createPhotoWall } from "@/features/photo-walls/repositories/photo-wall/createPhotoWall";
import { getProjectPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";

export async function createPhotoWallEntryAction(projectId: string) {
  if (!z.string().uuid().safeParse(projectId).success) return { success: false as const };
  try {
    const project = await requireProjectOwner(projectId);
    const wall = await getProjectPhotoWall(project.id);
    if (!wall) {
      try { await createPhotoWall({ p_project_id: project.id, p_name: project.name }); }
      catch (error) {
        // A second tab may have created the unique wall in the meantime.
        if (!await getProjectPhotoWall(project.id)) throw error;
      }
    }
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true as const };
  } catch { return { success: false as const }; }
}
