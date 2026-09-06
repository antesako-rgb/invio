import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
} from "@/features/events/types/event.types";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorData {
  invitation:
    Invitation;

  event:
    Event;
}


/* ==========================================================================
   Get Invitation Editor Data
========================================================================== */

export async function getInvitationEditorData(
  invitationId: string
): Promise<InvitationEditorData | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("invitations")
      .select(`
        *,
        event:events (
          *
        )
      `)
      .eq(
        "id",
        invitationId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "getInvitationEditorData error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return null;
  }

  return {
    invitation:
      data,

    event:
      data.event,
  };
}