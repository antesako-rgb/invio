"use client";

import {
  useState,
} from "react";

import type {
  Project,
} from "../types/project.types";

import {
  setProjectEventFormField,
  getProjectDefaultValues,
  getProjectFormValues,
} from "../utils/projectEventForm.utils";

import type {
  ProjectEventFormValues,
} from "../validation/projectEvent.schema";


/* ==========================================================================
   Types
========================================================================== */

interface UseProjectEventFormProps {
  event?: Project;
}


/* ==========================================================================
   Use Project Form
========================================================================== */

export function useProjectEventForm({
  event,
}: UseProjectEventFormProps = {}) {
  const [
    form,
    setForm,
  ] =
    useState<ProjectEventFormValues>(
      () =>
        event
          ? getProjectFormValues(
              event
            )
          : getProjectDefaultValues()
    );


  /* ==========================================================================
     Set Field
  ========================================================================== */

  function setField<
    K extends keyof ProjectEventFormValues,
  >(
    key: K,
    value: ProjectEventFormValues[K]
  ) {
    setForm(
      (current) => setProjectEventFormField(current, key, value)
    );
  }


  /* ==========================================================================
     Reset
  ========================================================================== */

  function reset() {
    setForm(
      event
        ? getProjectFormValues(
            event
          )
        : getProjectDefaultValues()
    );
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    form,
    setForm,
    setField,
    reset,
  };
}