import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateGuestGroupInput,
  GuestGroup,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Create Guest Group
========================================================================== */

export async function createGuestGroup(
  input: CreateGuestGroupInput
): Promise<GuestGroup> {
  const supabase =
    await createServerClient();


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
    console.error(
      "createGuestGroup error:",
      error
    );

    throw new Error(
      error.message
    );
  }


  return data;
}