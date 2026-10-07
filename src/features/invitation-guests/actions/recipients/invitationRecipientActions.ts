"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/lib/actions/actionResult";
import * as schemas from "../../validation/invitationRecipient.schema";
import * as repository from "../../repositories/recipients/mutateInvitationRecipients";
import { recipientError } from "./recipientError";

async function mutate<Input, Output>(input: unknown, schema: z.ZodType<Input, z.ZodTypeDef, unknown>, operation: (value: Input) => Promise<Output>): Promise<ActionResult<Output>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const data = await operation(parsed.data);
    revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests", "page");
    return { success: true, data } as ActionResult<Output>;
  } catch (error) {
    // Avoid logging RPC details/payloads that may contain contact or token data.
    return { success: false, code: recipientError(error) };
  }
}
export async function createInvitationRecipientAction(input: unknown) { return mutate(input, schemas.createRecipientSchema, repository.createInvitationRecipient); }
export async function updateInvitationRecipientAction(input: unknown) { return mutate(input, schemas.updateRecipientSchema, repository.updateInvitationRecipient); }
export async function deleteInvitationRecipientAction(input: unknown) { return mutate(input, schemas.deleteRecipientSchema, repository.deleteInvitationRecipient); }
