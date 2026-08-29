import {
  supabase,
} from "@/lib/supabase/client";

import type {
  GuestGroup,
  UpdateGuestGroupInput,
} from "../types/guest.types";


/* ==========================================================================
   Update Guest Group
========================================================================== */

export async function updateGuestGroup(
  groupId: string,
  changes: UpdateGuestGroupInput
): Promise<GuestGroup> {
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
    throw error;
  }

  return data;
}