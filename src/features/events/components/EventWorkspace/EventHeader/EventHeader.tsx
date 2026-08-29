import {
  CalendarDays,
  Clock3,
  Ellipsis,
  Globe2,
  MapPin,
  Pencil,
} from "lucide-react";

import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import {
  Button,
} from "@/components/ui/button";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import type {
  Event,
} from "@/features/events/types/event.types";

import {
  formatEventDate,
  formatEventTime,
} from "@/features/events/utils/eventDisplay.utils";

import styles from "./EventHeader.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const CUSTOM_EVENT_TYPES =
  new Set<string>([
    "other_private",
    "other_business",
    "other_social",
  ]);


/* ==========================================================================
   Types
========================================================================== */

interface EventHeaderProps {
  event:
    Event;
}


/* ==========================================================================
   Event Header
========================================================================== */

export default async function EventHeader({
  event,
}: EventHeaderProps) {
  const t =
    await getTranslations(
      "Events.header"
    );

  const tTypes =
    await getTranslations(
      "Events.types"
    );

  const locale =
    await getLocale();


  /* ==========================================================================
     Event Type
  ========================================================================== */

  const eventType =
    CUSTOM_EVENT_TYPES.has(
      event.type
    ) &&
    event.custom_type
      ? event.custom_type
      : tTypes(
          event.type
        );


  /* ==========================================================================
     Date
  ========================================================================== */

  const formattedDate =
    formatEventDate(
      event.start_date,
      locale
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        styles.header
      }
    >
      <div
        className={
          styles.main
        }
      >
        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.heading
            }
          >
            <h1
              className={
                styles.title
              }
            >
              {event.name}
            </h1>

            <div
              className={
                styles.type
              }
            >
              <span
                className={
                  styles.typeIndicator
                }
                aria-hidden="true"
              />

              <span>
                {eventType}
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
              </span>
            </div>

            {event.start_time && (
              <div
                className={
                  styles.metaItem
                }
              >
                <Clock3
                  aria-hidden="true"
                />

                <span>
                  {formatEventTime(
                    event.start_time
                  )}
                </span>
              </div>
            )}

            {event.location_name && (
              <div
                className={
                  styles.metaItem
                }
              >
                <MapPin
                  aria-hidden="true"
                />

                <span>
                  {
                    event.location_name
                  }
                </span>
              </div>
            )}

            {event.timezone && (
              <div
                className={
                  styles.metaItem
                }
              >
                <Globe2
                  aria-hidden="true"
                />

                <span>
                  {event.timezone}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={
            styles.actions
          }
        >
          <ButtonLink
            href={`/dashboard/dogadaji/${event.id}/uredi`}
            variant="outline"
          >
            <Pencil
              aria-hidden="true"
            />

            {t(
              "edit"
            )}
          </ButtonLink>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              t(
                "moreActions"
              )
            }
          >
            <Ellipsis
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </header>
  );
}