"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import { invitationRsvpSettingsSchema } from "../../validation/invitationRsvpSettings.schema";
import { updateInvitationRsvpSettings } from "../../repositories/invitation/updateInvitationRsvpSettings";
import { invitationRsvpSettingsError } from "./invitationRsvpSettingsError";

export async function updateInvitationRsvpSettingsAction(input: unknown): Promise<ActionResult> {
  const parsed = invitationRsvpSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    await updateInvitationRsvpSettings(parsed.data);
    revalidatePath("/[locale]/dashboard/invitations/[invitationId]/settings", "page");
    return { success: true };
  } catch (error) {
    return { success: false, code: invitationRsvpSettingsError(error) };
  }
}
