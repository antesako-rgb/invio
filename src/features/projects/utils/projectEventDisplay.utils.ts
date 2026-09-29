/* ==========================================================================
   Format ProjectEvent Date
========================================================================== */

export function formatProjectEventDate(
  date: string,
  locale: string
): string {
  return new Intl.DateTimeFormat(
    locale,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      `${date}T00:00:00`
    )
  );
}


/* ==========================================================================
   Format ProjectEvent Time
========================================================================== */

export function formatProjectEventTime(
  time: string
): string {
  return time.slice(
    0,
    5
  );
}