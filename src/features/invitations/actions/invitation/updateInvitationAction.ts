"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateInvitation,
} from "../../repositories/invitation/updateInvitation";


/* ==========================================================================
   Update Invitation Action
========================================================================== */

export async function updateInvitationAction(
  invitationId: string,
  name: string
): Promise<ActionResult> {
  try {
    const parsedName =
      z
        .string()
        .trim()
        .min(1)
        .max(150)
        .parse(
          name
        );

    await updateInvitation({
      p_invitation_id:
        invitationId,

      p_name:
        parsedName,
    });

    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invitation update failed.",
    };
  }
}