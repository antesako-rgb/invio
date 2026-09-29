"use server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { DeleteProjectInput } from "../types/project.types";
import { deleteProjectWithStorage } from "../services/deleteProjectWithStorage";

export async function deleteProjectAction(input: DeleteProjectInput): Promise<ActionResult> {
  try {
    await deleteProjectWithStorage(input.p_project_id);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true };
  } catch (error) {
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: false, message: error instanceof Error ? error.message : "Project operation failed." };
  }
}
