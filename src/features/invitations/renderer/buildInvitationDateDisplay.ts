import type {
  InvitationDateContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationDateDisplay,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Build Invitation Date Display
========================================================================== */

export function buildInvitationDateDisplay(
  dateContent: InvitationDateContent,
  locale: string
): InvitationDateDisplay {
  if (
    !dateContent.start_date
  ) {
    return {
      hasDate:
        false,

      value:
        null,

      formatted:
        "",

      day:
        "",

      dayName:
        "",

      month:
        "",

      year:
        "",
    };
  }

  const date =
    new Date(
      `${dateContent.start_date}T00:00:00`
    );

  const day =
    new Intl.DateTimeFormat(
      locale,
      {
        day:
          "numeric",
      }
    ).format(
      date
    );

  const dayName =
    new Intl.DateTimeFormat(
      locale,
      {
        weekday:
          "long",
      }
    ).format(
      date
    );

  const month =
    new Intl.DateTimeFormat(
      locale,
      {
        month:
          "long",
      }
    ).format(
      date
    );

  const year =
    new Intl.DateTimeFormat(
      locale,
      {
        year:
          "numeric",
      }
    ).format(
      date
    );

  const formatted =
    new Intl.DateTimeFormat(
      locale,
      {
        day:
          "numeric",

        month:
          "long",

        year:
          "numeric",
      }
    ).format(
      date
    );

  return {
    hasDate:
      true,

    value:
      dateContent.start_date,

    formatted,

    day,

    dayName,

    month,

    year,
  };
}