"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/actions/actionResult";
import { getInvitationRecipientLinkToken } from "../../repositories/recipients/getInvitationRecipientLinkToken";
import { recipientError } from "./recipientError";

export async function getInvitationRecipientLinkAction(input: unknown): Promise<ActionResult<{ token: string }>> {
  const parsed = z.object({ p_recipient_id: z.string().uuid() }).strict().safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    return { success: true, data: { token: await getInvitationRecipientLinkToken(parsed.data.p_recipient_id) } };
  } catch (error) {
    return { success: false, code: recipientError(error) };
  }
}
