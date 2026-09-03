"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  updateGuestGroup,
} from "@/features/guests/repositories/updateGuestGroup";

import type {
  GuestGroup,
} from "@/features/guests/types/guest.types";
import type {
  ActionResult,
} from "@/lib/actions/actionResult";


/* ==========================================================================
   Update Guest Group Action
========================================================================== */

export async function updateGuestGroupAction(
  eventId: string,
  groupId: string,
  name: string
): Promise<ActionResult<GuestGroup>> {
  try {
    const trimmedName =
      name.trim();


    if (!trimmedName) {
      return {
        success: false,
        message:
          "Naziv grupe je obavezan.",
      };
    }


    const group =
      await updateGuestGroup(
        groupId,
        {
          name:
            trimmedName,
        }
      );


    revalidatePath(
      `/dashboard/dogadaji/${eventId}/gosti`
    );


    return {
      success: true,
      data:
        group,
    };
  } catch (error) {
    console.error(
      "updateGuestGroupAction error:",
      error
    );


    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Došlo je do pogreške prilikom uređivanja grupe.",
    };
  }
}