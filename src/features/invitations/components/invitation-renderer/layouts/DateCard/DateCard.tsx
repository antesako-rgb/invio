import type { InvitationLayoutProps } from "../../InvitationLayouts";
import styles from "./DateCard.module.css";

/* ==========================================================================
   Date Card — a calendar centerpiece with event details
========================================================================== */

export default function DateCard({ page, locale }: InvitationLayoutProps) {
  const { title, text, date, time, location, address } = page.content;
  const dateValue = date?.trim() ?? "";
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(`${dateValue}T00:00:00Z`)
    : null;
  const validDate = parsedDate && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === dateValue
    ? parsedDate
    : null;

  function formatDate(options: Intl.DateTimeFormatOptions) {
    return validDate
      ? new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(validDate)
      : "";
  }

  return (
    <div className={styles.dateCard}>
      {title?.trim() && <h2 className={styles.title}>{title}</h2>}

      {validDate ? (
        <div className={styles.calendar}>
          <p className={styles.month}>{formatDate({ month: "long" })}</p>
          <div className={styles.dateRow}>
            <p className={styles.side}>{formatDate({ weekday: "long" })}</p>
            <time className={styles.day} dateTime={dateValue}>
              {formatDate({ day: "numeric" })}
            </time>
            <p className={styles.side}>{time?.trim()}</p>
          </div>
          <p className={styles.year}>{formatDate({ year: "numeric" })}</p>
        </div>
      ) : (
        <div className={styles.fallback}>
          {dateValue && <p>{dateValue}</p>}
          {time?.trim() && <p>{time}</p>}
        </div>
      )}

      {(location?.trim() || address?.trim()) && (
        <div className={styles.venue}>
          {location?.trim() && <p>{location}</p>}
          {address?.trim() && <p className={styles.address}>{address}</p>}
        </div>
      )}

      {text?.trim() && <p className={styles.message}>{text}</p>}
    </div>
  );
}
