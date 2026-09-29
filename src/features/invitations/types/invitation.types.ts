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

export interface UpdateInvitationDocumentInput {
  invitationId: string;
  document: InvitationDocument;
  documentVersion: number;
  documentRevision: number;
}