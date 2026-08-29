import {
  supabase,
} from "@/lib/supabase/client";


/* ==========================================================================
   Get Event Guests
========================================================================== */

export async function getEventGuests(
  eventId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("event_guests")
      .select(`
        *,
        group:guest_groups (
          id,
          name
        )
      `)
      .eq(
        "event_id",
        eventId
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return data;
}