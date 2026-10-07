import type { RsvpStatus, RsvpAnswersObject } from "@/features/invitations/types/publicRsvp.types";
import type { Tables } from "@/lib/supabase/database.types";
import type { InvitationRecipientWithGuests } from "./invitationRecipient.types";

export type GenericResponseGuest = Pick<Tables<"rsvp_response_guests">, "id" | "last_name"> & {
  first_name: string;
  status: RsvpStatus;
  answers: RsvpAnswersObject;
};

export type GenericInvitationResponse = Pick<Tables<"rsvp_responses">, "id" | "submitted_at"> & {
  guests: GenericResponseGuest[];
};

export type InvitationAttendanceRow = {
  kind: "personalized_recipient";
  recipient: InvitationRecipientWithGuests;
} | {
  kind: "generic_response";
  response: GenericInvitationResponse;
};
