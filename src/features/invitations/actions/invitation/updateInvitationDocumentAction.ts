"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  revalidatePath,
} from "next/cache";

import {
  updateInvitationDocument,
} from "../../repositories/invitation/updateInvitationDocument";

import {
  InvitationSaveConflict,
} from "../../utils/invitationRevision";

import type {
  UpdateInvitationDocumentInput,
} from "../../types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

type UpdateInvitationDocumentActionResult =
  ActionResult<
    Awaited<ReturnType<typeof updateInvitationDocument>>,
    "CONFLICT" | "SAVE_FAILED"
  >;


/* ==========================================================================
   Update Invitation Document Action
========================================================================== */

export async function updateInvitationDocumentAction(
  input:
    UpdateInvitationDocumentInput
): Promise<UpdateInvitationDocumentActionResult> {
  try {
    const data =
      await updateInvitationDocument(
        input
      );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );

    return {
      success:
        true,

      data,
    };
  } catch (error) {
    return {
      success:
        false,

      code:
        error instanceof InvitationSaveConflict
            ? "CONFLICT"
            : "SAVE_FAILED",
    };
  }
}
