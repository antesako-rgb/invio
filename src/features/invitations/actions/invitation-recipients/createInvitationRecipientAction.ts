"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createInvitationRecipient,
} from "@/features/invitations/repositories/invitation-recipients/createInvitationRecipient";

import type {
  CreateInvitationRecipientInput,
  InvitationRecipient,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Create Invitation Recipient Action
========================================================================== */

export async function createInvitationRecipientAction(
  input: CreateInvitationRecipientInput
): Promise<ActionResult<InvitationRecipient>> {
  try {
    const recipient =
      await createInvitationRecipient(
        input
      );

    revalidatePath(
      `/dashboard/pozivnice/${recipient.invitation_id}`
    );

    return {
      success: true,
      data: recipient,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće kreirati primatelja pozivnice.",
    };
  }
}