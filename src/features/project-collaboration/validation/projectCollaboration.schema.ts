import {
  z,
} from "zod";


/* ==========================================================================
   Invite Project Collaborator Schema
========================================================================== */

export const inviteProjectCollaboratorSchema =
  z.object({
    email:
      z
        .string()
        .trim()
        .min(
          1,
          "Email adresa je obavezna."
        )
        .email(
          "Unesite ispravnu email adresu."
        )
        .max(
          320,
          "Email adresa može imati najviše 320 znakova."
        )
        .transform(
          (value) =>
            value.toLowerCase()
        ),
  });


/* ==========================================================================
   Invite Project Collaborator Form Values
========================================================================== */

export type InviteProjectCollaboratorFormValues =
  z.infer<
    typeof inviteProjectCollaboratorSchema
  >;