import {
  CalendarDays,
  MapPin,
  Plus,
} from "lucide-react";

import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import type {
  Event,
} from "@/features/events/types/event.types";

import styles from "./DashboardEvents.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardEventsProps {
  events:
    Event[];
}


/* ==========================================================================
   Dashboard Events
========================================================================== */

export default async function DashboardEvents({
  events,
}: DashboardEventsProps) {
  const t =
    await getTranslations(
      "Dashboard.overview.events"
    );

  const locale =
    await getLocale();

  const visibleEvents =
    events.slice(
      0,
      3
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <h2
            className={
              styles.title
            }
          >
            {t("title")}
          </h2>

          <p
            className={
              styles.description
            }
          >
            {t(
              "description"
            )}
          </p>
        </div>

        <ButtonLink
          href="/dashboard/dogadaji/novi"
        >
          <Plus
            aria-hidden="true"
          />

          {t(
            "newEvent"
          )}
        </ButtonLink>
      </div>

      <div
        className={
          styles.list
        }
      >
        {visibleEvents.map(
          (event) => {
            const startDate =
              new Date(
                `${event.start_date}T00:00:00`
              );

            const day =
              new Intl.DateTimeFormat(
                locale,
                {
                  day: "2-digit",
                }
              ).format(
                startDate
              );

            const month =
              new Intl.DateTimeFormat(
                locale,
                {
                  month: "short",
                }
              )
                .format(
                  startDate
                )
                .replace(
                  ".",
                  ""
                )
                .toUpperCase();

            const formattedDate =
              new Intl.DateTimeFormat(
                locale,
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              ).format(
                startDate
              );

            const location =
              [
                event.location_name,
                event.location_address,
              ]
                .filter(
                  Boolean
                )
                .join(", ");

            return (
              <article
                key={
                  event.id
                }
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.date
                  }
                >
                  <span
                    className={
                      styles.dateDay
                    }
                  >
                    {day}
                  </span>

                  <span
                    className={
                      styles.dateMonth
                    }
                  >
                    {month}
                  </span>
                </div>

                <div
                  className={
                    styles.content
                  }
                >
                  <div
                    className={
                      styles.eventHeader
                    }
                  >
                    <div>
                      <h3
                        className={
                          styles.eventName
                        }
                      >
                        {event.name}
                      </h3>

                      <span
                        className={
                          styles.eventType
                        }
                      >
                        {event.custom_type ??
                          t(
                            `types.${event.type}`
                          )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      styles.meta
                    }
                  >
                    <div
                      className={
                        styles.metaItem
                      }
                    >
                      <CalendarDays
                        aria-hidden="true"
                      />

                      <span>
                        {formattedDate}

                        {event.start_time &&
                          ` · ${event.start_time.slice(
                            0,
                            5
                          )}`}
                      </span>
                    </div>

                    {location && (
                      <div
                        className={
                          styles.metaItem
                        }
                      >
                        <MapPin
                          aria-hidden="true"
                        />

                        <span>
                          {location}
                        </span>
                      </div>
                    )}
                  </div>

                  {event.planned_guests !==
                    null && (
                    <p
                      className={
                        styles.guests
                      }
                    >
                      {t(
                        "plannedGuests",
                        {
                          count:
                            event.planned_guests,
                        }
                      )}
                    </p>
                  )}
                </div>

                <ButtonLink
                  href={`/dashboard/dogadaji/${event.id}`}
                  variant="outline"
                >
                  {t(
                    "openEvent"
                  )}
                </ButtonLink>
              </article>
            );
          }
        )}
      </div>

      {events.length > 3 && (
        <div
          className={
            styles.footer
          }
        >
          <ButtonLink
            href="/dashboard/dogadaji"
            variant="ghost"
          >
            {t(
              "viewAll"
            )}
          </ButtonLink>
        </div>
      )}
    </section>
  );
}