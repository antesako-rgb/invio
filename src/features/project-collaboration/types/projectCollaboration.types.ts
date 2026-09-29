import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Project Collaborator Row
========================================================================== */

export type ProjectCollaboratorRow =
  Tables<"project_collaborators">;


/* ==========================================================================
   Project Collaborator
========================================================================== */

export type ProjectCollaborator =
  Database["public"]["Functions"]["get_project_collaborators"]["Returns"][number];


/* ==========================================================================
   Project Collaboration Invitation
========================================================================== */

export type ProjectCollaborationInvite =
  Tables<"project_collaboration_invites">;


/* ==========================================================================
   Project Collaboration Invitation Status
========================================================================== */

export type ProjectCollaborationInviteStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";


/* ==========================================================================
   Invite Project Collaborator
========================================================================== */

export type InviteProjectCollaboratorInput =
  Database["public"]["Functions"]["invite_project_collaborator"]["Args"];

export type InviteProjectCollaboratorResult =
  Database["public"]["Functions"]["invite_project_collaborator"]["Returns"][number];


/* ==========================================================================
   Accept Project Collaboration Invitation
========================================================================== */

export type AcceptProjectCollaborationInviteInput =
  Database["public"]["Functions"]["accept_project_collaboration_invite"]["Args"];


/* ==========================================================================
   Decline Project Collaboration Invitation
========================================================================== */

export type DeclineProjectCollaborationInviteInput =
  Database["public"]["Functions"]["decline_project_collaboration_invite"]["Args"];


/* ==========================================================================
   Cancel Project Collaboration Invitation
========================================================================== */

export type CancelProjectCollaborationInviteInput =
  Database["public"]["Functions"]["cancel_project_collaboration_invite"]["Args"];


/* ==========================================================================
   Remove Project Collaborator
========================================================================== */

export type RemoveProjectCollaboratorInput =
  Database["public"]["Functions"]["remove_project_collaborator"]["Args"];