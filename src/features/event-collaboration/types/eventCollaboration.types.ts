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

export type EventCollaborationInvite =
  Tables<"event_collaboration_invites">;


/* ==========================================================================
   Event Collaboration Invitation Status
========================================================================== */

export type EventCollaborationInviteStatus =
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

export type AcceptEventCollaborationInviteInput =
  Database["public"]["Functions"]["accept_event_collaboration_invite"]["Args"];


/* ==========================================================================
   Decline Event Collaboration Invitation
========================================================================== */

export type DeclineEventCollaborationInviteInput =
  Database["public"]["Functions"]["decline_event_collaboration_invite"]["Args"];


/* ==========================================================================
   Cancel Event Collaboration Invitation
========================================================================== */

export type CancelEventCollaborationInviteInput =
  Database["public"]["Functions"]["cancel_event_collaboration_invite"]["Args"];


/* ==========================================================================
   Remove Event Collaborator
========================================================================== */

export type RemoveEventCollaboratorInput =
  Database["public"]["Functions"]["remove_event_collaborator"]["Args"];