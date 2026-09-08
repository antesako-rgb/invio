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

import {
  getInvitationCardOrientation,
} from "@/features/invitations/cards/utils/invitationCard.utils";

import InvitationEditorPreviewContainer
  from "@/features/invitations/editor/components/InvitationEditorPreviewContainer/InvitationEditorPreviewContainer";

import InvitationRSVPPreviewMode
  from "@/features/invitations/editor/components/InvitationRSVPPreviewMode/InvitationRSVPPreviewMode";

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
  rsvpPreviewMode = "personalized",
  onRsvpPreviewModeChange,
  onRsvpSubmit,
  onGenericRsvpSubmit,
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

  const cardAspectRatio =
    template.card.aspectRatio;

  const cardOrientation =
    getInvitationCardOrientation(
      cardAspectRatio
    );

  const supportsDetails =
    template.features.details;

  const supportsRsvp =
    template.features.rsvp;

  const hasGuestActions =
    supportsDetails ||
    (
      supportsRsvp &&
      data.content.rsvp.enabled
    );


  /* ==========================================================================
     Guest Navigation
  ========================================================================== */

  function handleDetails() {
    if (
      !supportsDetails
    ) {
      return;
    }

    setGuestScreen(
      "details"
    );
  }

  function handleRsvp() {
    if (
      !supportsRsvp ||
      !data.content.rsvp.enabled
    ) {
      return;
    }

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
        if (
          !supportsDetails
        ) {
          return card;
        }

        return (
          <InvitationEditorPreviewContainer>
            <InvitationDetailsView
              data={
                data
              }
            />
          </InvitationEditorPreviewContainer>
        );

      case "rsvp":
        if (
          !supportsRsvp
        ) {
          return card;
        }

        return (
          <InvitationEditorPreviewContainer>
            {data.content.rsvp.allow_generic_responses &&
              onRsvpPreviewModeChange && (
                <InvitationRSVPPreviewMode
                  value={
                    rsvpPreviewMode
                  }
                  onChange={
                    onRsvpPreviewModeChange
                  }
                />
              )}

            <InvitationRSVPView
              data={
                data
              }
              eventTimezone={
                data.eventTimezone
              }
              previewState={
                rsvpPreviewState
              }
              previewMode={
                rsvpPreviewMode
              }
              onSubmit={
                onRsvpSubmit
              }
              onGenericSubmit={
                onGenericRsvpSubmit
              }
            />
          </InvitationEditorPreviewContainer>
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
        if (
          !supportsDetails
        ) {
          return card;
        }

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
        if (
          !supportsRsvp ||
          !data.content.rsvp.enabled
        ) {
          return card;
        }

        return (
          <InvitationRSVPView
            data={
              data
            }
            eventTimezone={
              data.eventTimezone
            }
            onBack={
              handleBackToCard
            }
            onSubmit={
              onRsvpSubmit
            }
            onGenericSubmit={
              onGenericRsvpSubmit
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
            cardOrientation={
              cardOrientation
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
              isPresented &&
              hasGuestActions
                ? (
                    <InvitationGuestActions
                      onDetails={
                        supportsDetails
                          ? handleDetails
                          : undefined
                      }
                      onRsvp={
                        supportsRsvp &&
                        data.content.rsvp.enabled
                          ? handleRsvp
                          : undefined
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

/* ==========================================================================
   Render
========================================================================== */

return (
  <InvitationExperience
    templateId={
      templateId
    }
    family={
      template.family
    }
    variantId={
      variantId
    }
    mode={
      mode
    }
    cardAspectRatio={
      cardAspectRatio
    }
  >
    {mode === "edit"
      ? renderEditorScreen()
      : renderGuestScreen()}
  </InvitationExperience>
);
}