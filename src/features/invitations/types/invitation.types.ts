import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  InvitationDocument,
} from "./invitationDocument.types";

export type Invitation =
  Tables<"invitations">;

export type CreateInvitationInput =
  Database["public"]["Functions"]["create_invitation"]["Args"];

export type UpdateInvitationInput =
  Database["public"]["Functions"]["update_invitation"]["Args"];

export type UpdateInvitationRsvpSettingsInput = Omit<
  Database["public"]["Functions"]["update_invitation_rsvp_settings"]["Args"],
  "p_generic_rsvp_capacity"
> & {
  p_generic_rsvp_capacity: Invitation["generic_rsvp_capacity"];
};

export interface UpdateInvitationDocumentInput {
  invitationId: string;
  document: InvitationDocument;
  documentVersion: number;
  documentRevision: number;
}
