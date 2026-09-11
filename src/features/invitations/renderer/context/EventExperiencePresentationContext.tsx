"use client";

import {
  createContext,
  useContext,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Context
========================================================================== */

const EventExperiencePresentationContext =
  createContext<
    EventExperiencePresentation | null
  >(
    null
  );


/* ==========================================================================
   Provider
========================================================================== */

interface EventExperiencePresentationProviderProps {
  presentation:
    EventExperiencePresentation;

  children:
    ReactNode;
}

export function EventExperiencePresentationProvider({
  presentation,
  children,
}: EventExperiencePresentationProviderProps) {
  return (
    <EventExperiencePresentationContext.Provider
      value={
        presentation
      }
    >
      {children}
    </EventExperiencePresentationContext.Provider>
  );
}


/* ==========================================================================
   Use Event Experience Presentation
========================================================================== */

export function useEventExperiencePresentation() {
  const presentation =
    useContext(
      EventExperiencePresentationContext
    );

  if (!presentation) {
    throw new Error(
      "useEventExperiencePresentation must be used inside EventExperiencePresentationProvider."
    );
  }

  return presentation;
}