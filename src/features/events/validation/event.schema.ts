import {
  z,
} from "zod";

import type {
  EventType,
} from "../types/event.types";


/* ==========================================================================
   Constants
========================================================================== */

export const EVENT_TYPES = [
  "wedding",
  "confirmation",
  "baptism",
  "communion",
  "birthday",
  "other_private",

  "conference",
  "seminar",
  "team_building",
  "reception",
  "gala_dinner",
  "other_business",

  "festival",
  "charity",
  "sports",
  "cultural",
  "music",
  "other_social",
] as const satisfies readonly EventType[];

export const CUSTOM_EVENT_TYPES = [
  "other_private",
  "other_business",
  "other_social",
] as const satisfies readonly EventType[];


/* ==========================================================================
   Helpers
========================================================================== */

function isCustomEventType(
  type: EventType
) {
  return (
    CUSTOM_EVENT_TYPES as readonly EventType[]
  ).includes(type);
}


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
            "Naziv događaja je obavezan."
          )
          .max(
            150,
            "Naziv događaja može imati najviše 150 znakova."
          ),

      type:
        z.enum(EVENT_TYPES),

      custom_type:
        z
          .string()
          .trim()
          .max(
            100,
            "Vrsta događaja može imati najviše 100 znakova."
          ),

      start_date:
        z.date({
          required_error:
            "Datum početka je obavezan.",

          invalid_type_error:
            "Datum početka nije ispravan.",
        }),

      end_date:
        z
          .date({
            invalid_type_error:
              "Datum završetka nije ispravan.",
          })
          .nullable(),

start_time:
  z
    .string()
    .nullable(),

end_time:
  z
    .string()
    .nullable(),
      timezone:
        z
          .string()
          .trim()
          .min(
            1,
            "Vremenska zona je obavezna."
          )
          .max(
            100,
            "Vremenska zona može imati najviše 100 znakova."
          ),

       location_name:
        z
          .string()
          .trim()
          .max(
            150,
            "Naziv lokacije može imati najviše 150 znakova."
          ),

      location_address:
        z
          .string()
          .trim()
          .max(
            250,
            "Adresa lokacije može imati najviše 250 znakova."
          ),

      planned_guests:
        z
          .number()
          .int(
            "Broj gostiju mora biti cijeli broj."
          )
          .positive(
            "Broj gostiju mora biti veći od 0."
          )
          .nullable(),

      planned_budget:
        z
          .number()
          .min(
            0,
            "Planirani budžet ne može biti negativan."
          )
          .nullable(),

      currency_code:
        z.string(),
    })
    .superRefine(
      (
        values,
        context
      ) => {
        /* ==================================================================
           Custom Event Type
        ================================================================== */

        const customType =
          values.custom_type.trim();

        if (
          isCustomEventType(
            values.type
          ) &&
          !customType
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

        if (
          !isCustomEventType(
            values.type
          ) &&
          customType
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "custom_type",
            ],
            message:
              "Prilagođena vrsta nije dopuštena za odabranu vrstu događaja.",
          });
        }

        /* ==================================================================
           Date Range
        ================================================================== */

        if (
          values.end_date &&
          values.end_date <
            values.start_date
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "end_date",
            ],
            message:
              "Datum završetka ne može biti prije datuma početka.",
          });
        }

        /* ==================================================================
           Time
        ================================================================== */

        if (
          values.end_time &&
          !values.start_time
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "end_time",
            ],
            message:
              "Za vrijeme završetka potrebno je unijeti vrijeme početka.",
          });
        }
      }
    );


/* ==========================================================================
   Event Form Values
========================================================================== */

export type EventFormValues =
  z.infer<
    typeof eventSchema
  >;