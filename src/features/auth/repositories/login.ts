import {
  supabase,
} from "@/lib/supabase/client";

import type {
  LoginInput,
} from "../types/auth.types";

import {
  createAuthError,
} from "../utils/authErrors";


/* ==========================================================================
   Login
========================================================================== */

export async function login(
  input: LoginInput
) {
  const {
    error,
  } =
    await supabase.auth.signInWithPassword({
      email:
        input.email,

      password:
        input.password,
    });

  if (error) {
    throw createAuthError(
      error
    );
  }
}