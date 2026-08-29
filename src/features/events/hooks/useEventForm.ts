"use client";

import {
  useState,
} from "react";

import type {
  Event,
} from "../types/event.types";

import {
  getEventDefaultValues,
  getEventFormValues,
} from "../utils/eventForm.utils";

import type {
  EventFormValues,
} from "../validation/event.schema";


/* ==========================================================================
   Types
========================================================================== */

interface UseEventFormProps {
  event?: Event;
}


/* ==========================================================================
   Use Event Form
========================================================================== */

export function useEventForm({
  event,
}: UseEventFormProps = {}) {
  const [
    form,
    setForm,
  ] =
    useState<EventFormValues>(
      () =>
        event
          ? getEventFormValues(
              event
            )
          : getEventDefaultValues()
    );


  /* ==========================================================================
     Set Field
  ========================================================================== */

  function setField<
    K extends keyof EventFormValues,
  >(
    key: K,
    value: EventFormValues[K]
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      })
    );
  }


  /* ==========================================================================
     Reset
  ========================================================================== */

  function reset() {
    setForm(
      event
        ? getEventFormValues(
            event
          )
        : getEventDefaultValues()
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