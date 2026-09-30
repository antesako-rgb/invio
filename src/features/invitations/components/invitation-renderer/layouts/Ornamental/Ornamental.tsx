import { invitationText } from "../../InvitationPresentation";
import type {
  InvitationLayoutProps,
} from "../../InvitationLayouts";

import styles
  from "./Ornamental.module.css";


/* ==========================================================================
   Ornamental Layout
========================================================================== */

export default function Ornamental({ presentation,
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
          {(title || presentation) && (
            <h2>
              {invitationText(presentation, "title", title)}
            </h2>
          )}
        </div>
      </div>

      {(subtitle ||
        formattedDate || presentation) && (
        <div
          className={
            styles.details
          }
        >
          {(subtitle || presentation) && (
            <p
              className={
                styles.subtitle
              }
            >
              {invitationText(presentation, "subtitle", subtitle)}
            </p>
          )}

          {(formattedDate || presentation) && (
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
                    invitationText(presentation, "date", date, formattedDate)
                  }
                </time>
              ) : (
                invitationText(presentation, "date", date, formattedDate)
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}