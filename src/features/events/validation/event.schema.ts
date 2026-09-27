import {
  z,
} from "zod";

import {
  EVENT_TYPES,
} from "../types/event.types";


/* ==========================================================================
   Event Schema
========================================================================== */

export const eventSchema =
  z
    .object({
      name:
        z
          .string()
          .trim()
          .min(
            1,
            "Unesite naziv događaja."
          )
          .max(150),

      type:
        z.enum(
          EVENT_TYPES
        ),

      custom_type:
        z
          .string()
          .trim()
          .max(100),

      start_date:
        z.date(),

      start_time:
        z
          .string()
          .regex(
            /^$|^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
            "Neispravno vrijeme."
          )
          .nullable(),

      location_name:
        z
          .string()
          .trim()
          .max(150),

      location_address:
        z
          .string()
          .trim()
          .max(250),
    })
    .superRefine(
      (
        values,
        context
      ) => {
        if (
          values.type === "other" &&
          !values.custom_type
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "custom_type",
            ],
            message:
              "Unesite vrstu događaja.",
          });
        }
      }
    )
    .transform(
      (values) => ({
        ...values,

        custom_type:
          values.type === "other"
            ? values.custom_type
            : "",
      })
    );


/* ==========================================================================
   Types
========================================================================== */

export type EventFormValues =
  z.infer<
    typeof eventSchema
  >;