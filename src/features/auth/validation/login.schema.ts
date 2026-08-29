import {
  z,
} from "zod";


/* ==========================================================================
   Types
========================================================================== */

interface LoginSchemaMessages {
  invalidEmail:
    string;

  passwordRequired:
    string;
}


/* ==========================================================================
   Login Schema
========================================================================== */

export function createLoginSchema(
  messages: LoginSchemaMessages
) {
  return z.object({
    email:
      z
        .string()
        .email(
          messages.invalidEmail
        ),

    password:
      z
        .string()
        .min(
          1,
          messages.passwordRequired
        ),
  });
}


/* ==========================================================================
   Login Form Values
========================================================================== */

export type LoginFormValues =
  z.infer<
    ReturnType<
      typeof createLoginSchema
    >
  >;