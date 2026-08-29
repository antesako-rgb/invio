"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateInvitation,
} from "@/features/invitations/repositories/updateInvitation";

import type {
  Invitation,
  UpdateInvitationData,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Update Invitation Action
========================================================================== */

export async function updateInvitationAction(
  input: UpdateInvitationData
): Promise<ActionResult<Invitation>> {
  try {
    const invitation =
      await updateInvitation(
        input
      );

    revalidatePath(
      `/dashboard/dogadaji/${invitation.event_id}/pozivnice`
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
          : "Nije moguće ažurirati pozivnicu.",
    };
  }
}