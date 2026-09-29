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
  useProjectEventForm,
} from "../../hooks/useProjectEventForm";

import type {
  ProjectEvent,
} from "../../types/projectEvent.types";

import {
  projectEventSchema,
  type ProjectEventFormValues,
} from "../../validation/projectEvent.schema";

import ProjectEventBasicInformationSection from "./ProjectEventBasicInformationSection/ProjectEventBasicInformationSection";

import ProjectEventScheduleSection from "./ProjectEventScheduleSection/ProjectEventScheduleSection";

import styles from "./ProjectEventForm.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ProjectEventFormProps {
  event?: ProjectEvent;

  onSubmit: (
    values: ProjectEventFormValues
  ) => Promise<void>;
}


/* ==========================================================================
   ProjectEvent Form
========================================================================== */

export default function ProjectEventForm({
  event,
  onSubmit,
}: ProjectEventFormProps) {
  const t =
    useTranslations(
      "Projects.eventDetails.form"
    );

  const {
    form,
    setField,
    reset,
  } =
    useProjectEventForm({
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
      projectEventSchema.safeParse(
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
      <ProjectEventBasicInformationSection
        form={form}
        disabled={
          isSubmitting
        }
        setField={
          setField
        }
      />

      <ProjectEventScheduleSection
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