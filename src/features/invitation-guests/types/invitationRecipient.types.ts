import type { Database, Tables } from "@/lib/supabase/database.types";
import type { InvitationGuest } from "./invitationGuest.types";
import type { RsvpStatus, RsvpAnswersObject } from "@/features/invitations/types/publicRsvp.types";


export type InvitationRecipient = Pick<Tables<"invitation_recipients">, "id" | "project_id" | "invitation_id" | "email" | "phone" | "created_at" | "updated_at">;

export type RecipientGuest = Pick<InvitationGuest, "id" | "is_primary" | "first_name" | "last_name">;

export type RecipientRsvpAnswer = {
  invitation_guest_id: string;
  status: RsvpStatus;
  answers: RsvpAnswersObject;
};

export type InvitationRecipientWithGuests = InvitationRecipient & {
  guests: RecipientGuest[];
  response: {
    submitted_at: string;
    guests: RecipientRsvpAnswer[];
  } | null;
};
type ContactInput<T> = Omit<T, "p_email" | "p_phone"> & {
  p_email: string | null;
  p_phone: string | null;
};

export type CreateInvitationRecipientInput = ContactInput<Database["public"]["Functions"]["create_invitation_recipient"]["Args"]>;

export type UpdateInvitationRecipientInput = ContactInput<Database["public"]["Functions"]["update_invitation_recipient"]["Args"]>;

export type CreatedInvitationRecipient = Pick<Database["public"]["Functions"]["create_invitation_recipient"]["Returns"][number], "recipient_id" | "token">;
