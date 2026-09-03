import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventGuest,
  UpdateEventGuestInput,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Update Event Guest
========================================================================== */

export async function updateEventGuest(
  guestId: string,
  changes: UpdateEventGuestInput
): Promise<EventGuest> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Current RSVP Status
  ========================================================================== */

  const {
    data: currentGuest,
    error: currentGuestError,
  } =
    await supabase
      .from("event_guests")
      .select(
        "rsvp_status"
      )
      .eq(
        "id",
        guestId
      )
      .single();


  if (currentGuestError) {
    throw currentGuestError;
  }


  /* ==========================================================================
     Update Guest
  ========================================================================== */

  const hasRsvpStatusChanged =
    changes.rsvp_status !== undefined &&
    changes.rsvp_status !==
      currentGuest.rsvp_status;

  const {
    data,
    error,
  } =
    await supabase
      .from("event_guests")
      .update({
        ...changes,

        ...(hasRsvpStatusChanged && {
          rsvp_status_source:
            "manual",
        }),
      })
      .eq(
        "id",
        guestId
      )
      .select()
      .single();


  if (error) {
    throw error;
  }


  return data;
}