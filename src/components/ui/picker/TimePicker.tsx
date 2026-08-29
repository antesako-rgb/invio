"use client";

import * as React from "react";

import {
  Clock3,
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Select,
} from "@/components/ui/select";

import {
  Button,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./TimePicker.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const HOURS_IN_DAY =
  24;

const MINUTES_IN_HOUR =
  60;


/* ==========================================================================
   Types
========================================================================== */

interface TimePickerProps {
  id?:
    string;

  value?:
    string | null;

  onChange:
    (
      value:
        string | null
    ) => void;

  disabled?:
    boolean;

  className?:
    string;

  minuteStep?:
    number;

  clearable?:
    boolean;

  minTime?:
    string | null;
}


/* ==========================================================================
   Helpers
========================================================================== */

function timeToMinutes(
  value:
    string | null | undefined
) {
  if (!value) {
    return null;
  }

  const [
    hours,
    minutes,
  ] =
    value
      .slice(
        0,
        5
      )
      .split(":")
      .map(Number);

  if (
    !Number.isInteger(
      hours
    ) ||
    !Number.isInteger(
      minutes
    )
  ) {
    return null;
  }

  return (
    hours *
      MINUTES_IN_HOUR +
    minutes
  );
}


/* ==========================================================================
   Time Picker
========================================================================== */

export function TimePicker({
  id,
  value,
  onChange,
  disabled = false,
  className,
  minuteStep = 5,
  clearable = false,
  minTime,
}: TimePickerProps) {
  const t =
    useTranslations(
      "Common.timePicker"
    );

  const [
    hours = "",
    minutes = "",
  ] =
    value
      ? value
          .slice(
            0,
            5
          )
          .split(":")
      : [];


  /* ==========================================================================
     Step
  ========================================================================== */

  const safeMinuteStep =
    React.useMemo(
      () => {
        if (
          minuteStep <= 0 ||
          minuteStep >
            MINUTES_IN_HOUR
        ) {
          return 5;
        }

        return minuteStep;
      },
      [
        minuteStep,
      ]
    );


  /* ==========================================================================
     Minimum Time
  ========================================================================== */

  const minTimeMinutes =
    React.useMemo(
      () =>
        timeToMinutes(
          minTime
        ),
      [
        minTime,
      ]
    );


  /* ==========================================================================
     Hour Options
  ========================================================================== */

  const hourOptions =
    React.useMemo(
      () =>
        Array.from(
          {
            length:
              HOURS_IN_DAY,
          },
          (
            _,
            hour
          ) => {
            const optionValue =
              String(
                hour
              ).padStart(
                2,
                "0"
              );

            const lastMinuteInHour =
              hour *
                MINUTES_IN_HOUR +
              (
                MINUTES_IN_HOUR -
                safeMinuteStep
              );

            return {
              value:
                optionValue,

              label:
                optionValue,

              disabled:
                minTimeMinutes !== null &&
                lastMinuteInHour <=
                  minTimeMinutes,
            };
          }
        ),
      [
        minTimeMinutes,
        safeMinuteStep,
      ]
    );


  /* ==========================================================================
     Minute Options
  ========================================================================== */

  const minuteOptions =
    React.useMemo(
      () =>
        Array.from(
          {
            length:
              Math.ceil(
                MINUTES_IN_HOUR /
                  safeMinuteStep
              ),
          },
          (
            _,
            index
          ) => {
            const minute =
              index *
              safeMinuteStep;

            const optionValue =
              String(
                minute
              ).padStart(
                2,
                "0"
              );

            const optionTime =
              hours
                ? Number(
                    hours
                  ) *
                    MINUTES_IN_HOUR +
                  minute
                : null;

            return {
              value:
                optionValue,

              label:
                optionValue,

              disabled:
                minTimeMinutes !== null &&
                optionTime !== null &&
                optionTime <=
                  minTimeMinutes,
            };
          }
        ),
      [
        hours,
        minTimeMinutes,
        safeMinuteStep,
      ]
    );


  /* ==========================================================================
     Change Hour
  ========================================================================== */

  function handleHourChange(
    nextHours:
      string
  ) {
    const nextMinutes =
      minutes ||
      "00";

    const nextValue =
      `${nextHours}:${nextMinutes}`;

    const nextValueMinutes =
      timeToMinutes(
        nextValue
      );

    if (
      minTimeMinutes !== null &&
      nextValueMinutes !== null &&
      nextValueMinutes <=
        minTimeMinutes
    ) {
      const firstAvailableMinute =
        minuteOptions.find(
          (option) =>
            !option.disabled
        );

      if (
        firstAvailableMinute
      ) {
        onChange(
          `${nextHours}:${firstAvailableMinute.value}`
        );

        return;
      }
    }

    onChange(
      nextValue
    );
  }


  /* ==========================================================================
     Change Minute
  ========================================================================== */

  function handleMinuteChange(
    nextMinutes:
      string
  ) {
    if (!hours) {
      return;
    }

    const nextValue =
      `${hours}:${nextMinutes}`;

    const nextValueMinutes =
      timeToMinutes(
        nextValue
      );

    if (
      minTimeMinutes !== null &&
      nextValueMinutes !== null &&
      nextValueMinutes <=
        minTimeMinutes
    ) {
      return;
    }

    onChange(
      nextValue
    );
  }


  /* ==========================================================================
     Clear
  ========================================================================== */

  function handleClear() {
    onChange(
      null
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={cn(
        styles.root,
        className
      )}
    >
      <Clock3
        className={
          styles.icon
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.controls
        }
      >
        <Select
          id={
            id
              ? `${id}_hours`
              : undefined
          }
          value={
            hours
          }
          onValueChange={
            handleHourChange
          }
          options={
            hourOptions
          }
          placeholder="--"
          disabled={
            disabled
          }
        />

        <span
          className={
            styles.separator
          }
          aria-hidden="true"
        >
          :
        </span>

        <Select
          id={
            id
              ? `${id}_minutes`
              : undefined
          }
          value={
            minutes
          }
          onValueChange={
            handleMinuteChange
          }
          options={
            minuteOptions
          }
          placeholder="--"
          disabled={
            disabled ||
            !hours
          }
        />
      </div>

      {clearable &&
        value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={
              styles.clear
            }
            aria-label={
              t(
                "clear"
              )
            }
            disabled={
              disabled
            }
            onClick={
              handleClear
            }
          >
            <X
              size={16}
              aria-hidden="true"
            />
          </Button>
        )}
    </div>
  );
}