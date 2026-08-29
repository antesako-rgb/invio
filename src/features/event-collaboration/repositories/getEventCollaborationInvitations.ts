import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventCollaborationInvitation,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Get Event Collaboration Invitations
========================================================================== */

export async function getEventCollaborationInvitations(
  eventId: string
): Promise<EventCollaborationInvitation[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "event_collaboration_invitations"
      )
      .select("*")
      .eq(
        "event_id",
        eventId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return data;
}