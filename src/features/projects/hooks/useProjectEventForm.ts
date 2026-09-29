"use client";

import {
  useState,
} from "react";

import type {
  ProjectEvent,
} from "../types/projectEvent.types";

import {
  setProjectEventFormField,
  getProjectEventDefaultValues,
  getProjectEventFormValues,
} from "../utils/projectEventForm.utils";

import type {
  ProjectEventFormValues,
} from "../validation/projectEvent.schema";


/* ==========================================================================
   Types
========================================================================== */

interface UseProjectEventFormProps {
  event?: ProjectEvent;
}


/* ==========================================================================
   Use ProjectEvent Form
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
          ? getProjectEventFormValues(
              event
            )
          : getProjectEventDefaultValues()
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
        ? getProjectEventFormValues(
            event
          )
        : getProjectEventDefaultValues()
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