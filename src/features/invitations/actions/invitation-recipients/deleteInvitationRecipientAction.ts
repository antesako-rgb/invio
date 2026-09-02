"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteInvitationRecipient,
} from "@/features/invitations/repositories/invitation-recipients/deleteInvitationRecipient";

import type {
  DeleteInvitationRecipientInput,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Delete Invitation Recipient Action
========================================================================== */

export async function deleteInvitationRecipientAction(
  input: DeleteInvitationRecipientInput
): Promise<ActionResult<void>> {
  try {
    await deleteInvitationRecipient(
      input
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće obrisati primatelja pozivnice.",
    };
  }
}