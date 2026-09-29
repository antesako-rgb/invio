import type {
  InvitationLayoutProps,
} from "../../InvitationLayouts";

import styles
  from "./Ornamental.module.css";


/* ==========================================================================
   Ornamental Layout
========================================================================== */

export default function Ornamental({
  page,
  locale,
}: InvitationLayoutProps) {
  const {
    title,
    subtitle,
    date,
  } = page.content;

  const formattedDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      date
    ) &&
    !Number.isNaN(
      Date.parse(
        date
      )
    )
      ? new Intl.DateTimeFormat(
          locale,
          {
            dateStyle:
              "long",

            timeZone:
              "UTC",
          }
        ).format(
          new Date(
            date
          )
        )
      : date;

  return (
    <div
      className={
        styles.ornamental
      }
    >
      <div
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.decoration
          }
          aria-hidden="true"
        />

        <div
          className={
            styles.names
          }
        >
          {title && (
            <h2>
              {title}
            </h2>
          )}
        </div>
      </div>

      {(subtitle ||
        formattedDate) && (
        <div
          className={
            styles.details
          }
        >
          {subtitle && (
            <p
              className={
                styles.subtitle
              }
            >
              {subtitle}
            </p>
          )}

          {formattedDate && (
            <p
              className={
                styles.date
              }
            >
              {date &&
              /^\d{4}-\d{2}-\d{2}$/.test(
                date
              ) ? (
                <time
                  dateTime={
                    date
                  }
                >
                  {
                    formattedDate
                  }
                </time>
              ) : (
                formattedDate
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}