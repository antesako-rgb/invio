"use server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { CreateProjectInput, Project } from "../types/project.types";
import { createProject } from "../repositories/createProject";

export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult<Project>> {
  try {
    const data = await createProject(input);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data };
  } catch (error) {
    
    return { success: false, message: error instanceof Error ? error.message : "Project operation failed." };
  }
}
