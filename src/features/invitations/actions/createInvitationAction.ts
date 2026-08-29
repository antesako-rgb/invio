"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createInvitation,
} from "@/features/invitations/repositories/createInvitation";

import type {
  CreateInvitationData,
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Create Invitation Action
========================================================================== */

export async function createInvitationAction(
  input: CreateInvitationData
): Promise<ActionResult<Invitation>> {
  try {
    const invitation =
      await createInvitation(
        input
      );

    revalidatePath(
      `/dashboard/dogadaji/${input.p_event_id}/pozivnice`
    );

    return {
      success: true,
      data: invitation,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće kreirati pozivnicu.",
    };
  }
}