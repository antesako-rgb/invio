import {
  z,
} from "zod";


/* ==========================================================================
   Types
========================================================================== */

interface RegisterSchemaMessages {
  firstNameRequired:
    string;

  lastNameRequired:
    string;

  invalidEmail:
    string;

  passwordMinLength:
    string;
}


/* ==========================================================================
   Register Schema
========================================================================== */

export function createRegisterSchema(
  messages: RegisterSchemaMessages
) {
  return z.object({
    firstName:
      z
        .string()
        .trim()
        .min(
          1,
          messages.firstNameRequired
        ),

    lastName:
      z
        .string()
        .trim()
        .min(
          1,
          messages.lastNameRequired
        ),

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
          8,
          messages.passwordMinLength
        ),
  });
}


/* ==========================================================================
   Register Form Values
========================================================================== */

export type RegisterFormValues =
  z.infer<
    ReturnType<
      typeof createRegisterSchema
    >
  >;