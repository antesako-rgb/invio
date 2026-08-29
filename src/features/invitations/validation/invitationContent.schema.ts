import {
  z,
} from "zod";


/* ==========================================================================
   Error Codes
========================================================================== */

export const INVITATION_DATE_VALIDATION_ERRORS = {
  END_WITHOUT_START:
    "end_without_start",

  END_BEFORE_START:
    "end_before_start",
} as const;


/* ==========================================================================
   Invitation Date
========================================================================== */

export const invitationDateSchema =
  z
    .object({
      start_date:
        z
          .string()
          .nullable(),

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
          value.end_date &&
          !value.start_date
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "end_date",
            ],

            message:
              INVITATION_DATE_VALIDATION_ERRORS
                .END_WITHOUT_START,
          });

          return;
        }

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
              INVITATION_DATE_VALIDATION_ERRORS
                .END_BEFORE_START,
          });
        }
      }
    );
    /* ==========================================================================
   Time Error Codes
========================================================================== */

export const INVITATION_TIME_VALIDATION_ERRORS = {
  END_WITHOUT_START:
    "end_without_start",

  END_NOT_AFTER_START:
    "end_not_after_start",
} as const;


/* ==========================================================================
   Invitation Time
========================================================================== */

export const invitationTimeSchema =
  z
    .object({
      start_time:
        z
          .string()
          .nullable(),

      end_time:
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
          value.end_time &&
          !value.start_time
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "end_time",
            ],

            message:
              INVITATION_TIME_VALIDATION_ERRORS
                .END_WITHOUT_START,
          });

          return;
        }

        if (
          value.start_time &&
          value.end_time &&
          value.end_time <=
            value.start_time
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "end_time",
            ],

            message:
              INVITATION_TIME_VALIDATION_ERRORS
                .END_NOT_AFTER_START,
          });
        }
      }
    );