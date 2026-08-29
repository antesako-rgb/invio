import {
  supabase,
} from "@/lib/supabase/client";

import type {
  Profile,
} from "../types/profile.types";


/* ==========================================================================
   Get Profile
========================================================================== */

export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from("profiles")
      .select("*")
      .eq(
        "id",
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}