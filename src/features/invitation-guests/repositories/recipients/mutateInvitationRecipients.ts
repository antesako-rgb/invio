import { createdRecipientSchema } from "../../validation/recipientToken.schema";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateInvitationRecipientInput, UpdateInvitationRecipientInput, CreatedInvitationRecipient } from "../../types/invitationRecipient.types";

export async function createInvitationRecipient(input: CreateInvitationRecipientInput): Promise<CreatedInvitationRecipient> {
  const db = await createServerClient();
  // Generated scalar argument types omit the nullable contact contract.
  const { data, error } = await db.rpc("create_invitation_recipient", input as Database["public"]["Functions"]["create_invitation_recipient"]["Args"]);
  if (error) throw error;
  return createdRecipientSchema.parse(data)[0];
}

export async function updateInvitationRecipient(input: UpdateInvitationRecipientInput): Promise<void> {
  const db = await createServerClient();
  const { error } = await db.rpc("update_invitation_recipient", input as Database["public"]["Functions"]["update_invitation_recipient"]["Args"]);
  if (error) throw error;
  // Do not expose the RPC's recipient row, which contains security fields.
}

export async function deleteInvitationRecipient(input: Database["public"]["Functions"]["delete_invitation_recipient"]["Args"]): Promise<void> {
  const db = await createServerClient();
  const { error } = await db.rpc("delete_invitation_recipient", input);
  if (error) throw error;
}
