"use server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { UpdateProjectInput, Project } from "../types/project.types";
import { updateProject } from "../repositories/updateProject";

export async function updateProjectAction(input: UpdateProjectInput): Promise<ActionResult<Project>> {
  try {
    const data = await updateProject(input);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data };
  } catch (error) {
    
    return { success: false, message: error instanceof Error ? error.message : "Project operation failed." };
  }
}
