/* ==========================================================================
   Format Event Date
========================================================================== */

export function formatEventDate(
  date: string,
  locale: string
) {
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
   Format Event Time
========================================================================== */

export function formatEventTime(
  time: string
) {
  return time.slice(
    0,
    5
  );
}