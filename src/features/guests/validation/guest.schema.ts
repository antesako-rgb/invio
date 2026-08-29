import {
  z,
} from "zod";


/* ==========================================================================
   Guest Schema
========================================================================== */

export const guestSchema =
  z.object({
    first_name:
      z
        .string()
        .trim()
        .min(
          1,
          "Ime je obavezno."
        )
        .max(
          100,
          "Ime može imati najviše 100 znakova."
        ),

    last_name:
      z
        .string()
        .trim()
        .max(
          100,
          "Prezime može imati najviše 100 znakova."
        ),

    email:
      z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" ||
            z
              .string()
              .email()
              .safeParse(
                value
              )
              .success,
          {
            message:
              "Unesite ispravnu email adresu.",
          }
        ),

    phone:
      z
        .string()
        .trim()
        .max(
          50,
          "Broj telefona može imati najviše 50 znakova."
        ),

    group_id:
      z
        .string()
        .uuid()
        .nullable(),

    notes:
      z
        .string()
        .trim()
        .max(
          1000,
          "Napomena može imati najviše 1000 znakova."
        ),
  });


/* ==========================================================================
   Guest Form Values
========================================================================== */

export type GuestFormValues =
  z.infer<
    typeof guestSchema
  >;