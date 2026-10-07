"use server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { GenericRsvpSuccess } from "../../types/genericRsvp.types";
import { getPublicInvitation } from "../../repositories/invitation/getPublicInvitation";
import { submitGenericRsvp } from "../../repositories/rsvp/genericRsvp";
import { submitGenericRsvpSchema, validateGenericAnswers } from "../../validation/genericRsvp.schema";
import { genericRsvpError } from "./genericRsvpError";
export async function submitGenericRsvpAction(input: unknown): Promise<ActionResult<GenericRsvpSuccess>> {
  const parsed = submitGenericRsvpSchema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const context = await getPublicInvitation(parsed.data.p_public_id);
    const page = context?.invitation.document.pages.find(page => page.type === "rsvp");
    if (!context?.invitation.generic_rsvp_enabled || !page) return { success: false, code: "RSVP_UNAVAILABLE" };
    if (parsed.data.p_guests.length > context.invitation.generic_rsvp_max_guests) return { success: false, code: "RSVP_GUEST_LIMIT_EXCEEDED" };
    let guests;
    try { guests = validateGenericAnswers(page.rsvp?.questions ?? [], parsed.data.p_guests); }
    catch { return { success: false, code: "RSVP_ANSWERS_INVALID" }; }
    const data = await submitGenericRsvp({ p_public_id: parsed.data.p_public_id, p_guests: guests });
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data };
  } catch (error) { return { success: false, code: genericRsvpError(error) }; }
}
