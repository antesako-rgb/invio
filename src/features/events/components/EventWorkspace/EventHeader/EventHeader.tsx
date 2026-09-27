import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
} from "lucide-react";

import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import BackLink
  from "@/components/ui/back-link/BackLink";

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
   Types
========================================================================== */

interface EventHeaderProps {
  event:
    Event;

  backHref?:
    string;
}


/* ==========================================================================
   Event Header
========================================================================== */

export default async function EventHeader({
  event,
  backHref,
}: EventHeaderProps) {
  const [
    t,
    tTypes,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "Events.header"
      ),

      getTranslations(
        "Events.types"
      ),

      getLocale(),
    ]);


  /* ==========================================================================
     Event Type
  ========================================================================== */

  const eventType =
    event.type === "other" &&
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
      {backHref && (
        <BackLink
          href={
            backHref
          }
          label={
            t(
              "back"
            )
          }
        />
      )}

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
          </div>
        </div>

        <div
          className={
            styles.actions
          }
        >
          <ButtonLink
            href={`/dashboard/dogadaji/${event.id}/uredi`}
            variant="default"
          >
            <Pencil
              aria-hidden="true"
            />

            {t(
              "edit"
            )}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}