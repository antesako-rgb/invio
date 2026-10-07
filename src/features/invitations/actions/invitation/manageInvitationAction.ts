"use server";

import {
  z,
} from "zod";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteInvitation,
} from "../../repositories/invitation/manageInvitation";

/* ==========================================================================
   Server Action
========================================================================== */

export async function manageInvitationAction(
  id:
    string,

  operation:
    "delete"
): Promise<ActionResult<null>> {
  try {
    z.string().uuid().parse(
      id
    );
    z.enum(
      ["delete"]
    ).parse(
      operation
    );
    await deleteInvitation(id);
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );
    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );
    return {
      success:
        true,

      data:
        null,
    };
  } catch {
    return {
      success:
        false,

      code:
        "INVITATION_UPDATE_FAILED",
    };
  }
}
