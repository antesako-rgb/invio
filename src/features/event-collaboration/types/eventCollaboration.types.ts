import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Event Collaborator Row
========================================================================== */

export type EventCollaboratorRow =
  Tables<"event_collaborators">;


/* ==========================================================================
   Event Collaborator
========================================================================== */

export type EventCollaborator =
  Database["public"]["Functions"]["get_event_collaborators"]["Returns"][number];


/* ==========================================================================
   Event Collaboration Invitation
========================================================================== */

export type EventCollaborationInvitation =
  Tables<"event_collaboration_invitations">;


/* ==========================================================================
   Event Collaboration Invitation Status
========================================================================== */

export type EventCollaborationInvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";


/* ==========================================================================
   Invite Event Collaborator
========================================================================== */

export type InviteEventCollaboratorInput =
  Database["public"]["Functions"]["invite_event_collaborator"]["Args"];

export type InviteEventCollaboratorResult =
  Database["public"]["Functions"]["invite_event_collaborator"]["Returns"][number];


/* ==========================================================================
   Accept Event Collaboration Invitation
========================================================================== */

export type AcceptEventCollaborationInvitationInput =
  Database["public"]["Functions"]["accept_event_collaboration_invitation"]["Args"];


/* ==========================================================================
   Decline Event Collaboration Invitation
========================================================================== */

export type DeclineEventCollaborationInvitationInput =
  Database["public"]["Functions"]["decline_event_collaboration_invitation"]["Args"];


/* ==========================================================================
   Cancel Event Collaboration Invitation
========================================================================== */

export type CancelEventCollaborationInvitationInput =
  Database["public"]["Functions"]["cancel_event_collaboration_invitation"]["Args"];


/* ==========================================================================
   Remove Event Collaborator
========================================================================== */

export type RemoveEventCollaboratorInput =
  Database["public"]["Functions"]["remove_event_collaborator"]["Args"];