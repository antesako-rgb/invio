"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import { submitPersonalizedRsvpSchema } from "../../validation/publicRsvp.schema";
import { getPublicRsvp, submitPersonalizedRsvp } from "../../repositories/rsvp/personalizedRsvp";
import { validateInvitationRsvpAnswers } from "../../utils/invitationRsvp";
import { publicRsvpError } from "./publicRsvpError";

export async function submitPersonalizedRsvpAction(input: unknown): Promise<ActionResult> {
  const parsed = submitPersonalizedRsvpSchema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const context = await getPublicRsvp(parsed.data.p_token);
    const expected = new Set(context.guests.map(guest => guest.invitation_guest_id));
    if (parsed.data.p_guests.length !== expected.size || parsed.data.p_guests.some(guest => !expected.has(guest.invitation_guest_id))) return { success: false, code: "INVALID_INPUT" };
    let guests;
    try { guests = validateInvitationRsvpAnswers(context.invitation.document.pages.find(page => page.type === "rsvp")?.rsvp?.questions ?? [], parsed.data.p_guests); }
    catch { return { success: false, code: "RSVP_ANSWERS_INVALID" }; }
    await submitPersonalizedRsvp({ p_token: parsed.data.p_token, p_guests: guests });
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true };
  } catch (error) {
    // No logging, analytics metadata or cache keys containing this credential.
    return { success: false, code: publicRsvpError(error) };
  }
}
