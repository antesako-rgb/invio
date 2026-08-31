"use client";

import {
  useState,
} from "react";

import {
  invitationCardRegistry,
} from "@/features/invitations/cards/registry/invitationCardRegistry";

import {
  getInvitationTemplateConfig,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry.utils";

import InvitationGuestActions
  from "@/features/invitations/experience/actions/InvitationGuestActions/InvitationGuestActions";

import InvitationDetailsView
  from "@/features/invitations/experience/details/InvitationDetailsView/InvitationDetailsView";

import InvitationEnvelope
  from "@/features/invitations/experience/envelope/InvitationEnvelope/InvitationEnvelope";

import InvitationExperience
  from "@/features/invitations/experience/InvitationExperience/InvitationExperience";

import {
  InvitationPresentationProvider,
} from "@/features/invitations/renderer/context/InvitationPresentationContext";

import type {
  InvitationRendererProps,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

type InvitationGuestScreen =
  | "card"
  | "details";


/* ==========================================================================
   Invitation Renderer
========================================================================== */

export default function InvitationRenderer({
  templateId,
  variantId,
  mode,
  data,
  editor,
}: InvitationRendererProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isPresented,
    setIsPresented,
  ] =
    useState(
      false
    );

  const [
    guestScreen,
    setGuestScreen,
  ] =
    useState<InvitationGuestScreen>(
      "card"
    );


  /* ==========================================================================
     Template
  ========================================================================== */

  const Card =
    invitationCardRegistry[
      templateId
    ];

  const template =
    getInvitationTemplateConfig(
      templateId
    );

  if (
    !Card ||
    !template
  ) {
    return null;
  }


  /* ==========================================================================
     Guest Navigation
  ========================================================================== */

  function handleDetails() {
    setGuestScreen(
      "details"
    );
  }

  function handleBackToCard() {
    setGuestScreen(
      "card"
    );
  }

  function handleRsvp() {
    // RSVP experience ide kasnije.
  }


  /* ==========================================================================
     Card
  ========================================================================== */

  const card = (
    <InvitationPresentationProvider
      presentation={
        data.presentation
      }
    >
      <Card
        data={
          data
        }
        mode={
          mode
        }
        editor={
          editor
        }
      />
    </InvitationPresentationProvider>
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <InvitationExperience
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      mode={
        mode
      }
    >
      {mode === "edit"
        ? card
        : guestScreen === "card"
          ? (
       <InvitationEnvelope
  envelopeId={
    template.envelopeId
  }
  initialState={
    isPresented
      ? "presented"
      : "closed"
  }
  onPresented={() =>
    setIsPresented(
      true
    )
  }
  actions={
    isPresented
      ? (
        <InvitationGuestActions
          onDetails={
            handleDetails
          }
          onRsvp={
            handleRsvp
          }
        />
      )
      : undefined
  }
>
  {card}
</InvitationEnvelope>
          )
          : (
            <InvitationDetailsView
              data={
                data
              }
              onBack={
                handleBackToCard
              }
            />
          )}
    </InvitationExperience>
  );
}