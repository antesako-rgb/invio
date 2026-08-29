import {
  supabase,
} from "@/lib/supabase/client";


/* ==========================================================================
   Delete Event Guest
========================================================================== */

export async function deleteEventGuest(
  guestId: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from("event_guests")
      .delete()
      .eq(
        "id",
        guestId
      );

  if (error) {
    throw error;
  }
}