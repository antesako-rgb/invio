"use client";

import {
  CalendarDays,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Field,
} from "@/components/ui/field";

import {
  DatePicker,
} from "@/components/ui/picker/DatePicker";

import {
  TimePicker,
} from "@/components/ui/picker/TimePicker";

import {
  Section,
} from "@/components/ui/section";

import type {
  EventFormValues,
} from "../../../validation/event.schema";

import styles from "./EventScheduleSection.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventScheduleSectionProps {
  form:
    EventFormValues;

  disabled?: boolean;

  setField: <
    K extends keyof EventFormValues,
  >(
    key: K,
    value: EventFormValues[K]
  ) => void;
}


/* ==========================================================================
   Event Schedule Section
========================================================================== */

export default function EventScheduleSection({
  form,
  disabled = false,
  setField,
}: EventScheduleSectionProps) {
  const t =
    useTranslations(
      "Events.form.schedule"
    );

  const isMultiDay =
    form.end_date !== null;


  /* ==========================================================================
     Schedule Type
  ========================================================================== */

  function handleSingleDay() {
    if (disabled) {
      return;
    }

    setField(
      "end_date",
      null
    );
  }

  function handleMultiDay() {
    if (
      disabled ||
      isMultiDay
    ) {
      return;
    }

    setField(
      "end_date",
      form.start_date
    );
  }


  /* ==========================================================================
     Start Date Change
  ========================================================================== */

  function handleStartDateChange(
    value: Date | undefined
  ) {
    if (!value) {
      return;
    }

    setField(
      "start_date",
      value
    );

    if (
      form.end_date &&
      form.end_date < value
    ) {
      setField(
        "end_date",
        value
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Section
      id="schedule"
      icon={CalendarDays}
      title={
        t(
          "title"
        )
      }
      description={
        t(
          "description"
        )
      }
    >
      <div
        className={
          styles.scheduleType
        }
        role="group"
        aria-label={
          t(
            "type.label"
          )
        }
      >
        <button
          type="button"
          className={
            `${styles.scheduleTypeButton} ${
              !isMultiDay
                ? styles.scheduleTypeButtonActive
                : ""
            }`
          }
          onClick={
            handleSingleDay
          }
          disabled={
            disabled
          }
          aria-pressed={
            !isMultiDay
          }
        >
          {t(
            "type.singleDay"
          )}
        </button>

        <button
          type="button"
          className={
            `${styles.scheduleTypeButton} ${
              isMultiDay
                ? styles.scheduleTypeButtonActive
                : ""
            }`
          }
          onClick={
            handleMultiDay
          }
          disabled={
            disabled
          }
          aria-pressed={
            isMultiDay
          }
        >
          {t(
            "type.multiDay"
          )}
        </button>
      </div>

      {!isMultiDay ? (
        <>
          <Field
            id="start_date"
            label={
              t(
                "date.label"
              )
            }
            required
          >
            <DatePicker
              id="start_date"
              value={
                form.start_date
              }
              onChange={
                handleStartDateChange
              }
              placeholder={
                t(
                  "date.placeholder"
                )
              }
              disabled={
                disabled
              }
            />
          </Field>

          <div
            className={
              styles.timeRange
            }
          >
            <Field
              id="start_time"
              label={
                t(
                  "time.start"
                )
              }
            >
              <TimePicker
                id="start_time"
                value={
                  form.start_time
                }
                onChange={(value) =>
                  setField(
                    "start_time",
                    value
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>

            <Field
              id="end_time"
              label={
                t(
                  "time.end"
                )
              }
            >
              <TimePicker
                id="end_time"
                value={
                  form.end_time
                }
                onChange={(value) =>
                  setField(
                    "end_time",
                    value
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <div
            className={
              styles.scheduleRow
            }
          >
            <Field
              id="start_date"
              label={
                t(
                  "startDate.label"
                )
              }
              required
            >
              <DatePicker
                id="start_date"
                value={
                  form.start_date
                }
                onChange={
                  handleStartDateChange
                }
                placeholder={
                  t(
                    "startDate.placeholder"
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>

            <Field
              id="start_time"
              label={
                t(
                  "startTime.label"
                )
              }
            >
              <TimePicker
                id="start_time"
                value={
                  form.start_time
                }
                onChange={(value) =>
                  setField(
                    "start_time",
                    value
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>
          </div>

          <div
            className={
              styles.scheduleRow
            }
          >
            <Field
              id="end_date"
              label={
                t(
                  "endDate.label"
                )
              }
              required
            >
              <DatePicker
                id="end_date"
                value={
                  form.end_date ??
                  undefined
                }
                onChange={(value) =>
                  setField(
                    "end_date",
                    value ?? null
                  )
                }
                placeholder={
                  t(
                    "endDate.placeholder"
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>

            <Field
              id="end_time"
              label={
                t(
                  "endTime.label"
                )
              }
            >
              <TimePicker
                id="end_time"
                value={
                  form.end_time
                }
                onChange={(value) =>
                  setField(
                    "end_time",
                    value
                  )
                }
                disabled={
                  disabled
                }
              />
            </Field>
          </div>
        </>
      )}
    </Section>
  );
}