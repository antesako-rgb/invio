import {
  z,
} from "zod";


/* ==========================================================================
   Invite Event Collaborator Schema
========================================================================== */

export const inviteEventCollaboratorSchema =
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
   Invite Event Collaborator Form Values
========================================================================== */

export type InviteEventCollaboratorFormValues =
  z.infer<
    typeof inviteEventCollaboratorSchema
  >;