"use server";
import type { Project } from "@/features/projects/types/project.types";
import { revalidatePath } from "next/cache";


import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createProjectEvent,
} from "@/features/projects/repositories/createProjectEvent";

import type {
  CreateProjectEventInput,
} from "@/features/projects/types/projectEvent.types";


/* ==========================================================================
   Create ProjectEvent Action
========================================================================== */

export async function createProjectEventAction(
  input: CreateProjectEventInput
): Promise<ActionResult<Project>> {
  try {
    const event =
      await createProjectEvent(
        input
      );

    revalidatePath("/[locale]/dashboard", "layout");

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće kreirati događaj.",
    };
  }
}