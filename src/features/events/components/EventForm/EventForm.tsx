"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import FormActions from "@/components/ui/form-actions/FormActions";

import {
  focusField,
} from "@/lib/forms/focusField";

import {
  scrollToField,
} from "@/lib/forms/scrollToField";

import {
  useEventForm,
} from "../../hooks/useEventForm";

import type {
  Event,
} from "../../types/event.types";

import {
  eventSchema,
  type EventFormValues,
} from "../../validation/event.schema";

import EventBasicInformationSection from "./EventBasicInformationSection/EventBasicInformationSection";

import EventPlanningSection from "./EventPlanningSection/EventPlanningSection";

import EventScheduleSection from "./EventScheduleSection/EventScheduleSection";

import styles from "./EventForm.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventFormProps {
  event?: Event;

  onSubmit: (
    values: EventFormValues
  ) => Promise<void>;
}


/* ==========================================================================
   Event Form
========================================================================== */

export default function EventForm({
  event,
  onSubmit,
}: EventFormProps) {
  const t =
    useTranslations(
      "Events.form"
    );

  const {
    form,
    setField,
    reset,
  } =
    useEventForm({
      event,
    });

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const isEditing =
    Boolean(event);


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function handleSubmit(
    submitEvent:
      FormEvent<HTMLFormElement>
  ) {
    submitEvent.preventDefault();

    if (isSubmitting) {
      return;
    }

    const result =
      eventSchema.safeParse(
        form
      );

    if (!result.success) {
      const firstError =
        result.error.issues[0];

      toast.error(
        firstError?.message ??
          t(
            "validationError"
          )
      );

      const field =
        firstError?.path[0];

      if (
        typeof field ===
        "string"
      ) {
        focusField(
          field
        );

        scrollToField(
          field
        );
      }

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      await onSubmit(
        result.data
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(
              "submitError"
            )
      );

      setIsSubmitting(
        false
      );
    }
  }


  /* ==========================================================================
     Reset
  ========================================================================== */

  function handleReset() {
    reset();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className={
        styles.form
      }
    >
      <EventBasicInformationSection
        form={form}
        disabled={
          isSubmitting
        }
        setField={
          setField
        }
      />

      <EventScheduleSection
        form={form}
        disabled={
          isSubmitting
        }
        setField={
          setField
        }
      />

      <EventPlanningSection
        form={form}
        disabled={
          isSubmitting
        }
        setField={
          setField
        }
      />

      <FormActions
        className={
          styles.actions
        }
        sticky
        isSubmitting={
          isSubmitting
        }
        submitDisabled={
          isSubmitting
        }
        onCancel={
          handleReset
        }
        cancelLabel={
          isEditing
            ? t(
                "actions.reset"
              )
            : t(
                "actions.clear"
              )
        }
        submitLabel={
          isEditing
            ? t(
                "actions.save"
              )
            : t(
                "actions.create"
              )
        }
      />
    </form>
  );
}