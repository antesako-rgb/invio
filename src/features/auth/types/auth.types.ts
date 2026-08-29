/* ==========================================================================
   Login Input
========================================================================== */

export interface LoginInput {
  email:
    string;

  password:
    string;
}


/* ==========================================================================
   Register Input
========================================================================== */

export interface RegisterInput {
  email:
    string;

  password:
    string;

  firstName:
    string;

  lastName:
    string;

  redirectTo?:
    string;
}


/* ==========================================================================
   Auth Error Code
========================================================================== */

export type AuthErrorCode =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userAlreadyExists"
  | "weakPassword"
  | "rateLimitExceeded"
  | "unknown";