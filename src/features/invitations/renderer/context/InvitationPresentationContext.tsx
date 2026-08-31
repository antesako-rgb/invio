"use client";

import {
  createContext,
  useContext,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Context
========================================================================== */

const InvitationPresentationContext =
  createContext<
    InvitationPresentation | null
  >(
    null
  );


/* ==========================================================================
   Provider
========================================================================== */

interface InvitationPresentationProviderProps {
  presentation:
    InvitationPresentation;

  children:
    ReactNode;
}

export function InvitationPresentationProvider({
  presentation,
  children,
}: InvitationPresentationProviderProps) {
  return (
    <InvitationPresentationContext.Provider
      value={
        presentation
      }
    >
      {children}
    </InvitationPresentationContext.Provider>
  );
}


/* ==========================================================================
   Use Invitation Presentation
========================================================================== */

export function useInvitationPresentation() {
  const presentation =
    useContext(
      InvitationPresentationContext
    );

  if (!presentation) {
    throw new Error(
      "useInvitationPresentation must be used inside InvitationPresentationProvider."
    );
  }

  return presentation;
}