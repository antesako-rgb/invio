"use client";

import {
  UsersRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Field,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

import {
  Section,
} from "@/components/ui/section";

import {
  Select,
} from "@/components/ui/select";

import type {
  EventFormValues,
} from "../../../validation/event.schema";


/* ==========================================================================
   Types
========================================================================== */

interface EventPlanningSectionProps {
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
   Constants
========================================================================== */

const CURRENCY_OPTIONS = [
  {
    value: "EUR",
    label: "EUR",
  },
  {
    value: "USD",
    label: "USD",
  },
  {
    value: "GBP",
    label: "GBP",
  },
];


/* ==========================================================================
   Event Planning Section
========================================================================== */

export default function EventPlanningSection({
  form,
  disabled = false,
  setField,
}: EventPlanningSectionProps) {
  const t =
    useTranslations(
      "Events.form.planning"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Section
      id="planning"
      icon={UsersRound}
      title={t("title")}
      description={
        t("description")
      }
    >
      <Field
        id="planned_guests"
        label={
          t(
            "plannedGuests.label"
          )
        }
        description={
          t(
            "plannedGuests.description"
          )
        }
      >
        <Input
          id="planned_guests"
          name="planned_guests"
          type="number"
          min={0}
          step={1}
          value={
            form.planned_guests ??
            ""
          }
          onChange={(event) =>
            setField(
              "planned_guests",
              event.target.value
                ? Number(
                    event.target.value
                  )
                : null
            )
          }
          placeholder={
            t(
              "plannedGuests.placeholder"
            )
          }
          disabled={disabled}
        />
      </Field>

      <Field
        id="planned_budget"
        label={
          t(
            "plannedBudget.label"
          )
        }
        description={
          t(
            "plannedBudget.description"
          )
        }
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <Input
            id="planned_budget"
            name="planned_budget"
            type="number"
            min={0}
            step="0.01"
            value={
              form.planned_budget ??
              ""
            }
            onChange={(event) =>
              setField(
                "planned_budget",
                event.target.value
                  ? Number(
                      event.target.value
                    )
                  : null
              )
            }
            placeholder={
              t(
                "plannedBudget.placeholder"
              )
            }
            disabled={disabled}
          />

          <Select
            id="currency_code"
            value={
              form.currency_code
            }
            onValueChange={(value) =>
              setField(
                "currency_code",
                value
              )
            }
            options={
              CURRENCY_OPTIONS
            }
            disabled={disabled}
          />
        </div>
      </Field>
    </Section>
  );
}