import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Get Event Invitations
========================================================================== */

export async function getEventInvitations(
  eventId: string
): Promise<Invitation[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("invitations")
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
    console.error(
      "getEventInvitations error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data ?? [];
}