"use client";

import * as React from "react";

import {
  format,
} from "date-fns";

import {
  enUS,
  hr,
} from "date-fns/locale";

import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  DayPicker,
} from "react-day-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/Popover";

import {
  Button,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./DatePicker.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const CURRENT_YEAR =
  new Date().getFullYear();

const START_YEAR =
  CURRENT_YEAR - 100;

const END_YEAR =
  CURRENT_YEAR + 20;


/* ==========================================================================
   Types
========================================================================== */

interface DatePickerProps {
  id?:
    string;

  value?:
    Date;

  onChange:
    (
      value: Date | undefined
    ) => void;

  placeholder?:
    string;

  disabled?:
    boolean;

  className?:
    string;

  clearable?:
    boolean;

  minDate?:
    Date;

  disablePast?:
    boolean;
}


/* ==========================================================================
   Date Picker
========================================================================== */

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "",
  disabled,
  className,
  clearable = false,
  minDate,
  disablePast = false,
}: DatePickerProps) {
  const [
    open,
    setOpen,
  ] =
    React.useState(false);

  const locale =
    useLocale();

  const t =
    useTranslations(
      "Common.datePicker"
    );

  const dateLocale =
    locale === "hr"
      ? hr
      : enUS;


  /* ==========================================================================
     Calendar Range
  ========================================================================== */

  const startMonth =
    React.useMemo(
      () =>
        new Date(
          START_YEAR,
          0,
          1
        ),
      []
    );

  const endMonth =
    React.useMemo(
      () =>
        new Date(
          END_YEAR,
          11,
          31
        ),
      []
    );


  /* ==========================================================================
     Minimum Date
  ========================================================================== */

  const today =
    React.useMemo(
      () => {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        return date;
      },
      []
    );

  const effectiveMinDate =
    React.useMemo(
      () => {
        if (
          disablePast &&
          minDate
        ) {
          return minDate > today
            ? minDate
            : today;
        }

        if (disablePast) {
          return today;
        }

        return minDate;
      },
      [
        disablePast,
        minDate,
        today,
      ]
    );


  /* ==========================================================================
     Clear
  ========================================================================== */

  function handleClear(
    event:
      React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    onChange(
      undefined
    );

    setOpen(
      false
    );
  }


  /* ==========================================================================
     Select
  ========================================================================== */

  function handleSelect(
    date:
      Date | undefined
  ) {
    if (!date) {
      return;
    }

    onChange(
      date
    );

    setOpen(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Popover
      open={
        open
      }
      onOpenChange={
        setOpen
      }
    >
      <PopoverTrigger
        render={
          <Button
            id={
              id
            }
            type="button"
            variant="outline"
            className={cn(
              styles.trigger,

              !value &&
                styles.placeholder,

              open &&
                styles.triggerOpen,

              className
            )}
            disabled={
              disabled
            }
          >
            <span
              className={
                styles.triggerValue
              }
            >
              {value
                ? format(
                    value,
                    "P",
                    {
                      locale:
                        dateLocale,
                    }
                  )
                : placeholder}
            </span>

            <span
              className={
                styles.triggerActions
              }
            >
              {clearable &&
                value && (
                  <span
                    role="button"
                    tabIndex={
                      0
                    }
                    aria-label={
                      t(
                        "clear"
                      )
                    }
                    className={
                      styles.clear
                    }
                    onClick={
                      handleClear
                    }
                  >
                    <X
                      className="size-4"
                    />
                  </span>
                )}

              <CalendarIcon
                className={
                  styles.calendarIcon
                }
              />
            </span>
          </Button>
        }
      />

      <PopoverContent
        sideOffset={
          8
        }
        className={
          styles.popover
        }
      >
        <DayPicker
          mode="single"
          locale={
            dateLocale
          }
          selected={
            value
          }
          captionLayout="dropdown"
          startMonth={
            startMonth
          }
          endMonth={
            endMonth
          }
          disabled={
            effectiveMinDate
              ? {
                  before:
                    effectiveMinDate,
                }
              : undefined
          }
          components={{
            Chevron: ({
              orientation,
              className,
            }) => {
              if (
                orientation ===
                "left"
              ) {
                return (
                  <ChevronLeft
                    className={
                      className
                    }
                  />
                );
              }

              if (
                orientation ===
                "right"
              ) {
                return (
                  <ChevronRight
                    className={
                      className
                    }
                  />
                );
              }

              return (
                <ChevronDown
                  className={
                    className
                  }
                />
              );
            },
          }}
          classNames={{
            root:
              styles.calendar,

            months:
              styles.months,

            month:
              styles.month,

            month_caption:
              styles.monthCaption,

            dropdowns:
              styles.dropdowns,

            dropdown_root:
              styles.dropdownRoot,

            dropdown:
              styles.dropdown,

            caption_label:
              styles.captionLabel,

            nav:
              styles.nav,

            button_previous:
              styles.previousButton,

            button_next:
              styles.nextButton,

            chevron:
              styles.chevron,

            month_grid:
              styles.monthGrid,

            weekdays:
              styles.weekdays,

            weekday:
              styles.weekday,

            week:
              styles.week,

            day:
              styles.day,

            day_button:
              styles.dayButton,

            selected:
              styles.selected,

            today:
              styles.today,

            disabled:
              styles.disabled,

            outside:
              styles.outside,
          }}
          onSelect={
            handleSelect
          }
        />
      </PopoverContent>
    </Popover>
  );
}


/* ==========================================================================
   Export
========================================================================== */

export {
  DatePicker,
};