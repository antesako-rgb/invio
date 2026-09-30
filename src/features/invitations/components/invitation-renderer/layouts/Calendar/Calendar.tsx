import { invitationText } from "../../InvitationPresentation";
import type { InvitationLayoutProps } from "../../InvitationLayouts";
import styles from "./Calendar.module.css";

/* ==========================================================================
   Calendar — purely derived from the renderer's resolved shared date
========================================================================== */

export default function Calendar({ presentation, page, locale }: InvitationLayoutProps) {
  const { title, date, time, location, address, text } = page.content;
  const value = date?.trim() ?? "";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  const valid = parsed && !Number.isNaN(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === value ? parsed : null;
  const first = valid ? new Date(valid) : null;
  first?.setUTCDate(1);
  const last = valid ? new Date(valid) : null;
  last?.setUTCMonth(last.getUTCMonth() + 1, 0);
  // Match the app's HR / en-US locale conventions without local-time shifts.
  const weekStart = locale.startsWith("hr") ? 1 : 0;
  const offset = first ? (first.getUTCDay() - weekStart + 7) % 7 : 0;
  const count = last?.getUTCDate() ?? 0;
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const fullDate = valid ? new Intl.DateTimeFormat(locale, {
    dateStyle: "long", timeZone: "UTC",
  }).format(valid) : value;

  return (
    <div className={styles.calendarLayout}>
      {(title?.trim() || presentation) && <h2 className={styles.names}>{invitationText(presentation, "title", title)}</h2>}
      {valid && (
        <table className={styles.calendar}>
          <caption>
            {invitationText(presentation, "date", date, new Intl.DateTimeFormat(locale, {
              month: "long", year: "numeric", timeZone: "UTC",
            }).format(valid))}
          </caption>
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, day) => (
                <th key={day} scope="col">
                  {weekday.format(new Date(Date.UTC(2023, 0, 1 + weekStart + day)))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil((offset + count) / 7) }, (_, row) => (
              <tr key={row}>
                {Array.from({ length: 7 }, (_, column) => {
                  const day = row * 7 + column - offset + 1;
                  const inMonth = day > 0 && day <= count;
                  const selected = inMonth && day === valid.getUTCDate();
                  return (
                    <td key={column}>
                      {inMonth && (selected ? (
                        <time className={styles.selected} dateTime={value} aria-label={fullDate}>{invitationText(presentation, "date", date, day)}</time>
                      ) : <span className={styles.day}>{day}</span>)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(fullDate || time?.trim() || presentation) && (
        <div className={styles.date}>
          {(fullDate || presentation) && (valid ? <time dateTime={value}>{invitationText(presentation, "date", date, fullDate)}</time> : <p>{invitationText(presentation, "date", date)}</p>)}
          {(time?.trim() || presentation) && <p>{invitationText(presentation, "time", time)}</p>}
        </div>
      )}
      {(location?.trim() || address?.trim() || presentation) && (
        <>
          <span className={styles.separator} aria-hidden="true" />
          <div className={styles.venue}>
            {(location?.trim() || presentation) && <p>{invitationText(presentation, "location", location)}</p>}
            {(address?.trim() || presentation) && <p>{invitationText(presentation, "address", address)}</p>}
          </div>
        </>
      )}
      {(text?.trim() || presentation) && <p className={styles.message}>{invitationText(presentation, "text", text)}</p>}
    </div>
  );
}
