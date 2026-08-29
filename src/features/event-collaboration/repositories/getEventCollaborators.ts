import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventCollaborator,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Get Event Collaborators
========================================================================== */

export async function getEventCollaborators(
  eventId: string
): Promise<EventCollaborator[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_event_collaborators",
      {
        p_event_id:
          eventId,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}