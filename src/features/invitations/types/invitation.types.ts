import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Invitation
========================================================================== */

export type Invitation =
  Tables<"invitations">;


/* ==========================================================================
   Create Invitation Input
========================================================================== */

export type CreateInvitationInput =
  Database["public"]["Functions"]["create_invitation"]["Args"];


/* ==========================================================================
   Create Invitation Data
========================================================================== */

export interface CreateInvitationData {

  p_event_id:
    string;

  p_name:
    string;

  p_template_id:
    string;

  p_variant_id:
    string;

  p_content?:
    InvitationContent;

  p_presentation?:
    InvitationPresentation;

}


/* ==========================================================================
   Update Invitation Input
========================================================================== */

export type UpdateInvitationInput =
  Database["public"]["Functions"]["update_invitation"]["Args"];


/* ==========================================================================
   Update Invitation Data
========================================================================== */

export interface UpdateInvitationData {

  p_invitation_id:
    string;

  p_name:
    string;

  p_template_id:
    string;

  p_variant_id:
    string;

  p_content:
    InvitationContent;

  p_presentation:
    InvitationPresentation;

}


/* ==========================================================================
   Publish Invitation Input
========================================================================== */

export type PublishInvitationInput =
  Database["public"]["Functions"]["publish_invitation"]["Args"];


/* ==========================================================================
   Unpublish Invitation Input
========================================================================== */

export type UnpublishInvitationInput =
  Database["public"]["Functions"]["unpublish_invitation"]["Args"];


/* ==========================================================================
   Set Primary RSVP Invitation Input
========================================================================== */

export type SetPrimaryRsvpInvitationInput =
  Database["public"]["Functions"]["set_primary_rsvp_invitation"]["Args"];


/* ==========================================================================
   Delete Invitation Input
========================================================================== */

export type DeleteInvitationInput =
  Database["public"]["Functions"]["delete_invitation"]["Args"];


/* ==========================================================================
   Public Invitation Input
========================================================================== */

export type GetPublicInvitationInput =
  Database["public"]["Functions"]["get_public_invitation"]["Args"];


/* ==========================================================================
   Public Invitation
========================================================================== */

export type PublicInvitation =
  Database["public"]["Functions"]["get_public_invitation"]["Returns"][number];