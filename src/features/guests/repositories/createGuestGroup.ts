import {
  supabase,
} from "@/lib/supabase/client";

import type {
  CreateGuestGroupInput,
  GuestGroup,
} from "../types/guest.types";


/* ==========================================================================
   Create Guest Group
========================================================================== */

export async function createGuestGroup(
  input: CreateGuestGroupInput
): Promise<GuestGroup> {
  const {
    data,
    error,
  } =
    await supabase
      .from("guest_groups")
      .insert(input)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}