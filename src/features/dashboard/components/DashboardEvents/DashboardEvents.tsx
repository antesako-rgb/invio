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

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import type {
  Event,
} from "@/features/events/types/event.types";

import {
  getDashboardProducts,
} from "../../repositories/getDashboardProducts";

import DashboardProductSummary from "./DashboardProductSummary";

import styles from "./DashboardEvents.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardEventsProps {
  limit?: number | null;

  events:
    Event[];
}


/* ==========================================================================
   Dashboard Events
========================================================================== */

export default async function DashboardEvents({
  events,
  limit = 3,
}: DashboardEventsProps) {
  const [
    t,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "Dashboard.overview.events"
      ),

      getLocale(),
    ]);

  const visibleEvents =
    limit === null
      ? events
      : events.slice(
          0,
          limit
        );

  const products =
    await getDashboardProducts(
      visibleEvents.map(
        (event) =>
          event.id
      )
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
            {t(
              "title"
            )}
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

{events.length === 0 && (
  <EmptyState
    variant="card"
    icon={
      CalendarDays
    }
    title={
      t(
        "empty.title"
      )
    }
    description={
      t(
        "empty.description"
      )
    }
    action={
      <ButtonLink
        href="/dashboard/dogadaji/novi"
      >
        <Plus
          aria-hidden="true"
        />

        {t(
          "empty.action"
        )}
      </ButtonLink>
    }
  />
)}

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
                  day:
                    "2-digit",
                }
              ).format(
                startDate
              );

            const month =
              new Intl.DateTimeFormat(
                locale,
                {
                  month:
                    "short",
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
                  day:
                    "numeric",

                  month:
                    "long",

                  year:
                    "numeric",
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
                .join(
                  ", "
                );

            const photoWall =
              products.walls.find(
                (wall) =>
                  wall.event_id ===
                  event.id
              ) ?? null;

            const album =
              products.albums.find(
                (item) =>
                  item.event_id ===
                  event.id
              ) ?? null;

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
                        {(event.type ===
                        "other"
                          ? event.custom_type
                          : null) ??
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
                </div>

                <DashboardProductSummary
                  kind="photoWall"
                  eventId={
                    event.id
                  }
                  product={
                    photoWall
                  }
                />

                <DashboardProductSummary
                  kind="album"
                  eventId={
                    event.id
                  }
                  product={
                    album
                  }
                />

<ButtonLink
  className={
    styles.openEvent
  }
  size="lg"
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

      {limit !== null &&
        events.length >
          limit && (
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