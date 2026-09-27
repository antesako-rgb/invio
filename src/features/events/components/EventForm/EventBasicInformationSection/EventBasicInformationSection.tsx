"use client";

import {
  FileText,
  MapPin,
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

import {
  EVENT_TYPES,
  isEventType,
} from "../../../types/event.types";

import type {
  EventFormValues,
} from "../../../validation/event.schema";


/* ==========================================================================
   Types
========================================================================== */

interface EventBasicInformationSectionProps {
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
   Event Basic Information Section
========================================================================== */

export default function EventBasicInformationSection({
  form,
  disabled = false,
  setField,
}: EventBasicInformationSectionProps) {
  const t =
    useTranslations(
      "Events.form.basic"
    );

  const tTypes =
    useTranslations(
      "Events.types"
    );

  const typeOptions =
    EVENT_TYPES.map(
      (type) => ({
        value:
          type,

        label:
          tTypes(
            type
          ),
      })
    );

  const hasCustomType =
    form.type === "other";


  /* ==========================================================================
     Event Type Change
  ========================================================================== */

  function handleTypeChange(
    value: string
  ) {
    if (!isEventType(value)) {
      return;
    }

    setField(
      "type",
      value
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <Section
        id="osnovno"
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
        icon={
          FileText
        }
      >
        <Field
          id="name"
          label={
            t(
              "name.label"
            )
          }
          required
        >
          <Input
            id="name"
            name="name"
            value={
              form.name
            }
            onChange={(event) =>
              setField(
                "name",
                event.target.value
              )
            }
            placeholder={
              t(
                "name.placeholder"
              )
            }
            disabled={
              disabled
            }
          />
        </Field>

        <Field
          id="type"
          label={
            t(
              "type.label"
            )
          }
          required
        >
          <Select
            id="type"
            value={
              form.type
            }
            onValueChange={
              handleTypeChange
            }
            placeholder={
              t(
                "type.placeholder"
              )
            }
            options={
              typeOptions
            }
            disabled={
              disabled
            }
          />
        </Field>

        {hasCustomType && (
          <Field
            id="custom_type"
            label={
              t(
                "customType.label"
              )
            }
            description={
              t(
                "customType.description"
              )
            }
            required
          >
            <Input
              id="custom_type"
              name="custom_type"
              value={
                form.custom_type
              }
              onChange={(event) =>
                setField(
                  "custom_type",
                  event.target.value
                )
              }
              placeholder={
                t(
                  "customType.placeholder"
                )
              }
              disabled={
                disabled
              }
            />
          </Field>
        )}
      </Section>

      <Section
        id="location"
        icon={
          MapPin
        }
        title={
          t(
            "location.title"
          )
        }
      >
        <Field
          id="location_name"
          label={
            t(
              "locationName.label"
            )
          }
        >
          <Input
            id="location_name"
            name="location_name"
            value={
              form.location_name
            }
            onChange={(event) =>
              setField(
                "location_name",
                event.target.value
              )
            }
            placeholder={
              t(
                "locationName.placeholder"
              )
            }
            autoComplete="organization"
            disabled={
              disabled
            }
          />
        </Field>

        <Field
          id="location_address"
          label={
            t(
              "locationAddress.label"
            )
          }
        >
          <Input
            id="location_address"
            name="location_address"
            value={
              form.location_address
            }
            onChange={(event) =>
              setField(
                "location_address",
                event.target.value
              )
            }
            placeholder={
              t(
                "locationAddress.placeholder"
              )
            }
            autoComplete="street-address"
            disabled={
              disabled
            }
          />
        </Field>
      </Section>
    </>
  );
}