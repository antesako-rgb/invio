import type {
  EventExperienceDateContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperienceDateDisplay,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Helpers
========================================================================== */

function buildDateParts(
  value: string,
  locale: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
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
    day,
    dayName,
    month,
    year,
    formatted,
  };
}


/* ==========================================================================
   Build Event Experience Date Display
========================================================================== */

export function buildEventExperienceDateDisplay(
  dateContent: EventExperienceDateContent,
  locale: string
): EventExperienceDateDisplay {
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

      hasEndDate:
        false,

      endValue:
        null,

      endDay:
        "",

      endDayName:
        "",

      endMonth:
        "",

      endYear:
        "",
    };
  }

  const start =
    buildDateParts(
      dateContent.start_date,
      locale
    );

  const end =
    dateContent.end_date
      ? buildDateParts(
          dateContent.end_date,
          locale
        )
      : null;

  return {
    hasDate:
      true,

    value:
      dateContent.start_date,

    formatted:
      start.formatted,

    day:
      start.day,

    dayName:
      start.dayName,

    month:
      start.month,

    year:
      start.year,

    hasEndDate:
      Boolean(end),

    endValue:
      dateContent.end_date,

    endDay:
      end?.day ?? "",

    endDayName:
      end?.dayName ?? "",

    endMonth:
      end?.month ?? "",

    endYear:
      end?.year ?? "",
  };
}