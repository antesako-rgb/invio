"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import { respondToReceivedCollaborationInvite } from "../repositories/respondToReceivedCollaborationInvite";

export async function respondToReceivedCollaborationAction(
  inviteId: string, response: "accept" | "decline",
): Promise<ActionResult<string>> {
  const parsed = z.object({ inviteId: z.string().uuid(), response: z.enum(["accept", "decline"]) }).safeParse({ inviteId, response });
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const projectId = await respondToReceivedCollaborationInvite(parsed.data.inviteId, parsed.data.response);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data: projectId };
  } catch {
    return { success: false, code: "COLLABORATION_FAILED" };
  }
}
