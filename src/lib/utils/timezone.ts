/* ==========================================================================
   Get Date In Timezone
========================================================================== */

export function getDateInTimezone(
  timezone: string
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          timezone,

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    ).formatToParts(
      new Date()
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day"
    )?.value;

  return `${year}-${month}-${day}`;
}


/* ==========================================================================
   Is Date Passed In Timezone
========================================================================== */

export function isDatePassedInTimezone(
  date: string | null,
  timezone?: string
): boolean {
  if (
    !date ||
    !timezone
  ) {
    return false;
  }

  return (
    getDateInTimezone(
      timezone
    ) >
    date
  );
}
/* ==========================================================================
   Parse Date Only
========================================================================== */

export function parseDateOnly(
  value: string
): Date {
  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}