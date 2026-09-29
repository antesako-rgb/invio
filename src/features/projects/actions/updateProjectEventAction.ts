"use server";
import { revalidatePath } from "next/cache";


import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateProjectEvent,
} from "@/features/projects/repositories/updateProjectEvent";

import type {
  ProjectEvent,
  UpdateProjectEventInput,
} from "@/features/projects/types/projectEvent.types";


/* ==========================================================================
   Update ProjectEvent Action
========================================================================== */

export async function updateProjectEventAction(
  input: UpdateProjectEventInput
): Promise<ActionResult<ProjectEvent>> {
  try {
    const event =
      await updateProjectEvent(
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
          : "Nije moguće ažurirati događaj.",
    };
  }
}