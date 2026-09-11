import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
  SetPrimaryRsvpInvitationInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Set Primary RSVP Invitation
========================================================================== */

export async function setPrimaryRsvpInvitation(
  input:
    SetPrimaryRsvpInvitationInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "set_primary_rsvp_invitation",
      input
    );

  if (error) {
    console.error(
      "setPrimaryRsvpInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Glavna RSVP pozivnica nije postavljena."
    );
  }

  return data as EventExperience;
}