import type {
  AuthError as SupabaseAuthError,
} from "@supabase/supabase-js";

import type {
  AuthErrorCode,
} from "../types/auth.types";


/* ==========================================================================
   Auth Error
========================================================================== */

export class AuthError extends Error {
  code:
    AuthErrorCode;

  constructor(
    code: AuthErrorCode
  ) {
    super(code);

    this.name =
      "AuthError";

    this.code =
      code;
  }
}


/* ==========================================================================
   Get Auth Error Code
========================================================================== */

export function getAuthErrorCode(
  error: SupabaseAuthError
): AuthErrorCode {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";

    case "email_not_confirmed":
      return "emailNotConfirmed";

    case "user_already_exists":
      return "userAlreadyExists";

    case "weak_password":
      return "weakPassword";

    case "over_request_rate_limit":
      return "rateLimitExceeded";

    default:
      return "unknown";
  }
}


/* ==========================================================================
   Create Auth Error
========================================================================== */

export function createAuthError(
  error: SupabaseAuthError
) {
  return new AuthError(
    getAuthErrorCode(
      error
    )
  );
}