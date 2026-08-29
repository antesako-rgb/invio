import {
  supabase,
} from "@/lib/supabase/client";

import {
  createAuthError,
} from "../utils/authErrors";


/* ==========================================================================
   Logout
========================================================================== */

export async function logout() {
  const {
    error,
  } =
    await supabase.auth.signOut();

  if (error) {
    throw createAuthError(
      error
    );
  }
}