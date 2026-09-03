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

import InvitationRSVPView
  from "@/features/invitations/experience/rsvp/InvitationRSVPView/InvitationRSVPView";

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
  | "details"
  | "rsvp";


/* ==========================================================================
   Invitation Renderer
========================================================================== */

export default function InvitationRenderer({
  templateId,
  variantId,
  mode,
  data,
  editor,
  editorStep = "design",
  rsvpPreviewState = "form",
  eventTimezone,
  onRsvpSubmit,
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

  const envelopeId =
    template.envelopeId;


  /* ==========================================================================
     Guest Navigation
  ========================================================================== */

  function handleDetails() {
    setGuestScreen(
      "details"
    );
  }

  function handleRsvp() {
    setGuestScreen(
      "rsvp"
    );
  }

  function handleBackToCard() {
    setGuestScreen(
      "card"
    );
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
     Editor Screen
  ========================================================================== */

  function renderEditorScreen() {
    switch (
      editorStep
    ) {
      case "details":
        return (
          <InvitationDetailsView
            data={
              data
            }
          />
        );

      case "rsvp":
        return (
          <InvitationRSVPView
            data={
              data
            }
            previewState={
              rsvpPreviewState
            }
            onSubmit={
              onRsvpSubmit
            }
          />
        );

      case "design":
      default:
        return card;
    }
  }


  /* ==========================================================================
     Guest Screen
  ========================================================================== */

  function renderGuestScreen() {
    switch (
      guestScreen
    ) {
      case "details":
        return (
          <InvitationDetailsView
            data={
              data
            }
            onBack={
              handleBackToCard
            }
          />
        );

      case "rsvp":
        return (
          <InvitationRSVPView
            data={
              data
            }
            eventTimezone={
              eventTimezone
            }
            onBack={
              handleBackToCard
            }
            onSubmit={
              onRsvpSubmit
            }
          />
        );

      case "card":
      default:
        return (
          <InvitationEnvelope
            envelopeId={
              envelopeId
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
        );
    }
  }


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
        ? renderEditorScreen()
        : renderGuestScreen()}
    </InvitationExperience>
  );
}