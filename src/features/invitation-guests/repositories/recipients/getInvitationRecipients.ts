import type { InvitationGuest } from "../../types/invitationGuest.types";
import { rsvpAnswersSchema, personalizedRsvpStatusSchema } from "@/features/invitations/validation/publicRsvp.schema";
import { createServerClient } from "@/lib/supabase/server";
import type { InvitationRecipient, InvitationRecipientWithGuests, RecipientGuest } from "../../types/invitationRecipient.types";
import { getInvitationGuests as readGuests } from "../guests/getInvitationGuests";

export async function getInvitationRecipients(invitationId: string): Promise<InvitationRecipient[]> {
  const db = await createServerClient();
  const { data, error } = await db.from("invitation_recipients")
    .select("id,project_id,invitation_id,email,phone,created_at,updated_at")
    .eq("invitation_id", invitationId).order("created_at", {
      ascending: false
    }).order("id");
  if (error) throw error;
  return data;
}

export async function getInvitationRecipientManagement(invitationId: string): Promise<{
  recipients: InvitationRecipientWithGuests[];
  guests: InvitationGuest[];
}> {
  const [recipients, guests, responses] = await Promise.all([
    getInvitationRecipients(invitationId),
    readGuests(invitationId),
    getRecipientResponses(invitationId),
  ]);
  const grouped = new Map<string, RecipientGuest[]>();
  for (const guest of guests) {
    if (!guest.recipient_id)
      continue;
    const linked = grouped.get(guest.recipient_id) ?? [];
    linked.push({
      id: guest.id,
      is_primary: guest.is_primary,
      first_name: guest.first_name,
      last_name: guest.last_name
    });
    grouped.set(guest.recipient_id, linked);
  }
  const mapped = recipients.map(recipient => ({
    ...recipient,
    response: responses.get(recipient.id) ?? null,
    guests: grouped.get(recipient.id) ?? []
  }));
  return {
    recipients: mapped,
    guests
  };
}

async function getRecipientResponses(invitationId: string) {
  const db = await createServerClient();
  const { data, error } = await db.from("rsvp_responses")
    .select("id,recipient_id,submitted_at,rsvp_response_guests(invitation_guest_id,status,answers)")
    .eq("invitation_id", invitationId).eq("response_type", "personalized");
  if (error) throw error;
  const result = new Map<string, NonNullable<InvitationRecipientWithGuests["response"]>>();
  for (const response of data) {
    if (!response.recipient_id)
      throw new Error("Invalid personalized RSVP recipient");
    const guests: NonNullable<InvitationRecipientWithGuests["response"]>["guests"] = response.rsvp_response_guests.map(guest => {
      if (!guest.invitation_guest_id)
        throw new Error("Invalid personalized RSVP guest identity");
      return {
        invitation_guest_id: guest.invitation_guest_id,
        status: personalizedRsvpStatusSchema.parse(guest.status),
        answers: rsvpAnswersSchema.parse(guest.answers)
      };
    });
    if (result.has(response.recipient_id))
      throw new Error("Duplicate personalized RSVP response");
    result.set(response.recipient_id, {
      submitted_at: response.submitted_at,
      guests
    });
  }
  return result;
}
