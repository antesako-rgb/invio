import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GuestGroup,
  UpdateGuestGroupInput,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Update Guest Group
========================================================================== */

export async function updateGuestGroup(
  groupId: string,
  changes: UpdateGuestGroupInput
): Promise<GuestGroup> {
  const supabase =
    await createServerClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("guest_groups")
      .update(changes)
      .eq(
        "id",
        groupId
      )
      .select()
      .single();


  if (error) {
    console.error(
      "updateGuestGroup error:",
      error
    );

    throw new Error(
      error.message
    );
  }


  return data;
}