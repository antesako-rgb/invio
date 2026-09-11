"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  getDateInTimezone,
  parseDateOnly,
} from "@/lib/utils/timezone";

import "./EventExperienceCountdown.css";


/* ==========================================================================
   Constants
========================================================================== */

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceCountdownProps {
  date:
    string | null;

  timezone:
    string;
}


/* ==========================================================================
   Helpers
========================================================================== */

function getDaysRemaining(
  date:
    string,
  timezone:
    string
) {
  const currentDate =
    getDateInTimezone(
      timezone
    );

  const target =
    parseDateOnly(
      date
    );

  const current =
    parseDateOnly(
      currentDate
    );

  const difference =
    (
      target.getTime() -
      current.getTime()
    ) /
    MILLISECONDS_PER_DAY;

  return Math.max(
    0,
    Math.round(
      difference
    )
  );
}


/* ==========================================================================
   Event Experience Countdown
========================================================================== */

export default function EventExperienceCountdown({
  date,
  timezone,
}: EventExperienceCountdownProps) {
  const t =
    useTranslations(
      "EventExperiences.experience.countdown"
    );

  const [
    daysRemaining,
    setDaysRemaining,
  ] =
    useState<number | null>(
      null
    );


  /* ==========================================================================
     Countdown
  ========================================================================== */

  useEffect(
    () => {
      if (!date) {
        setDaysRemaining(
          null
        );

        return;
      }

      const targetDate =
        date;

      function updateCountdown() {
        setDaysRemaining(
          getDaysRemaining(
            targetDate,
            timezone
          )
        );
      }

      updateCountdown();

      const interval =
        window.setInterval(
          updateCountdown,
          60 * 1000
        );

      return () => {
        window.clearInterval(
          interval
        );
      };
    },
    [
      date,
      timezone,
    ]
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  if (
    daysRemaining === null
  ) {
    return null;
  }

  return (
    <div data-event-experience-countdown>
      <span data-event-experience-countdown-value>
        {daysRemaining}
      </span>

      <span data-event-experience-countdown-label>
        {t(
          "days",
          {
            count:
              daysRemaining,
          }
        )}
      </span>
    </div>
  );
}