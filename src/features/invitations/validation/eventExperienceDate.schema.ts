import {
  z,
} from "zod";


/* ==========================================================================
   Date Error Codes
========================================================================== */

export const EVENT_EXPERIENCE_DATE_VALIDATION_ERRORS = {
  START_REQUIRED:
    "date_start_required",

  END_BEFORE_START:
    "date_end_before_start",
} as const;


/* ==========================================================================
   Event Experience Date
========================================================================== */

export const eventExperienceDateSchema =
  z
    .object({
      start_date:
        z
          .string()
          .nullable()
          .refine(
            (
              value
            ) =>
              value !== null &&
              value.trim() !== "",
            {
              message:
                EVENT_EXPERIENCE_DATE_VALIDATION_ERRORS
                  .START_REQUIRED,
            }
          ),

      end_date:
        z
          .string()
          .nullable(),
    })
    .superRefine(
      (
        value,
        context
      ) => {
        if (
          value.start_date &&
          value.end_date &&
          value.end_date <
            value.start_date
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "end_date",
            ],

            message:
              EVENT_EXPERIENCE_DATE_VALIDATION_ERRORS
                .END_BEFORE_START,
          });
        }
      }
    );