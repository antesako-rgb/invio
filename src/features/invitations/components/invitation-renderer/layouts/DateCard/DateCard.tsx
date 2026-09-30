import { invitationText } from "../../InvitationPresentation";
import type { InvitationLayoutProps } from "../../InvitationLayouts";
import styles from "./DateCard.module.css";

/* ==========================================================================
   Date Card — a calendar centerpiece with event details
========================================================================== */

export default function DateCard({ presentation, page, locale }: InvitationLayoutProps) {
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
      {(title?.trim() || presentation) && <h2 className={styles.title}>{invitationText(presentation, "title", title)}</h2>}

      {validDate ? (
        <div className={styles.calendar}>
          <p className={styles.month}>{invitationText(presentation, "date", date, formatDate({ month: "long" }))}</p>
          <div className={styles.dateRow}>
            <p className={styles.side}>{invitationText(presentation, "date", date, formatDate({ weekday: "long" }))}</p>
            <time className={styles.day} dateTime={dateValue}>
              {invitationText(presentation, "date", date, formatDate({ day: "numeric" }))}
            </time>
            <p className={styles.side}>{invitationText(presentation, "time", time)}</p>
          </div>
          <p className={styles.year}>{invitationText(presentation, "date", date, formatDate({ year: "numeric" }))}</p>
        </div>
      ) : (
        <div className={styles.fallback}>
          {(dateValue || presentation) && <p>{invitationText(presentation, "date", date)}</p>}
          {(time?.trim() || presentation) && <p>{invitationText(presentation, "time", time)}</p>}
        </div>
      )}

      {(location?.trim() || address?.trim() || presentation) && (
        <div className={styles.venue}>
          {(location?.trim() || presentation) && <p>{invitationText(presentation, "location", location)}</p>}
          {(address?.trim() || presentation) && <p className={styles.address}>{invitationText(presentation, "address", address)}</p>}
        </div>
      )}

      {(text?.trim() || presentation) && <p className={styles.message}>{invitationText(presentation, "text", text)}</p>}
    </div>
  );
}
