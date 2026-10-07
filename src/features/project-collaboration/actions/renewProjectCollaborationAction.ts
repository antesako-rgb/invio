"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { RenewProjectCollaborationInviteResult } from "../types/projectCollaboration.types";
import { renewProjectCollaborationInvite } from "../repositories/renewProjectCollaborationInvite";

export async function renewProjectCollaborationAction(inviteId: string): Promise<ActionResult<RenewProjectCollaborationInviteResult>> {
  if (!z.string().uuid().safeParse(inviteId).success) return { success: false, code: "INVALID_INPUT" };
  try {
    const invite = await renewProjectCollaborationInvite(inviteId);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data: invite };
  } catch {
    return { success: false, code: "COLLABORATION_FAILED" };
  }
}
