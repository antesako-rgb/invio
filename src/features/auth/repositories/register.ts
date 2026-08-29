import {
  supabase,
} from "@/lib/supabase/client";

import type {
  RegisterInput,
} from "../types/auth.types";

import {
  createAuthError,
} from "../utils/authErrors";


/* ==========================================================================
   Register
========================================================================== */

export async function register(
  input: RegisterInput
) {
  const {
    error,
  } =
    await supabase.auth.signUp({
      email:
        input.email,

      password:
        input.password,

      options: {
        emailRedirectTo:
          input.redirectTo,

        data: {
          first_name:
            input.firstName,

          last_name:
            input.lastName,
        },
      },
    });

  if (error) {
    throw createAuthError(
      error
    );
  }
}