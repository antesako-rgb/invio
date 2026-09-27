import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventCollaborationInvite,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Get Event Collaboration Invitations
========================================================================== */

export async function getEventCollaborationInvites(
  eventId: string
): Promise<EventCollaborationInvite[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "event_collaboration_invites"
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