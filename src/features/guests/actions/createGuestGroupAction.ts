"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createGuestGroup,
} from "@/features/guests/repositories/createGuestGroup";

import type {
  GuestGroup,
} from "@/features/guests/types/guest.types";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

/* ==========================================================================
   Create Guest Group Action
========================================================================== */

export async function createGuestGroupAction(
  eventId: string,
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
      await createGuestGroup({
        event_id:
          eventId,

        name:
          trimmedName,
      });


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
      "createGuestGroupAction error:",
      error
    );


    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Došlo je do pogreške prilikom kreiranja grupe.",
    };
  }
}