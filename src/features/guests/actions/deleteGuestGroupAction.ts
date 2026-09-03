"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  deleteGuestGroup,
} from "@/features/guests/repositories/deleteGuestGroup";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

/* ==========================================================================
   Delete Guest Group Action
========================================================================== */

export async function deleteGuestGroupAction(
  eventId: string,
  groupId: string
): Promise<ActionResult<null>> {
  try {
    await deleteGuestGroup(
      groupId
    );


    revalidatePath(
      `/dashboard/dogadaji/${eventId}/gosti`
    );


    return {
      success: true,
      data:
        null,
    };
  } catch (error) {
    console.error(
      "deleteGuestGroupAction error:",
      error
    );


    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Došlo je do pogreške prilikom brisanja grupe.",
    };
  }
}