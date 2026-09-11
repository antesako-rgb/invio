"use client";

import {
  useState,
} from "react";

import {
  getEventExperienceTemplate,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  getEventExperienceCardOrientation,
} from "@/features/invitations/cards/utils/eventExperienceCard.utils";

import EventExperience
  from "@/features/invitations/components/event-experiences/EventExperience/EventExperience";

import EventExperienceCardStage
  from "@/features/invitations/components/event-experiences/EventExperienceCardStage/EventExperienceCardStage";

import InvitationDetailsView
  from "@/features/invitations/components/invitation-experience/details/InvitationDetailsView/InvitationDetailsView";

import InvitationEnvelope
  from "@/features/invitations/components/invitation-experience/envelope/InvitationEnvelope/InvitationEnvelope";

import InvitationGuestActions
  from "@/features/invitations/components/invitation-experience/InvitationGuestActions/InvitationGuestActions";

import InvitationRSVPView
  from "@/features/invitations/components/invitation-experience/rsvp/InvitationRSVPView/InvitationRSVPView";

import PhotoWallActions
  from "@/features/invitations/components/photo-wall-experience/PhotoWallActions/PhotoWallActions";

import PhotoWallExperience
  from "@/features/invitations/components/photo-wall-experience/PhotoWallExperience";

import {
  previewPhotoWallPhotos,
} from "@/features/invitations/components/photo-wall-experience/preview/previewPhotoWallPhotos";

import EventExperienceEditorPreviewContainer
  from "@/features/invitations/editor/components/EventExperienceEditorPreviewContainer/EventExperienceEditorPreviewContainer";

import InvitationRSVPPreviewMode
  from "@/features/invitations/editor/components/InvitationRSVPPreviewMode/InvitationRSVPPreviewMode";

import {
  EventExperiencePresentationProvider,
} from "@/features/invitations/renderer/context/EventExperiencePresentationContext";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/invitations/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  EventExperienceRendererProps,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

type EventExperienceScreen =
  | "card"
  | "details"
  | "rsvp"
  | "photos";


/* ==========================================================================
   Event Experience Renderer
========================================================================== */

export default function EventExperienceRenderer({
  templateId,
  variantId,
  mode,
  data,
  editor,
  editorStep = "design",
}: EventExperienceRendererProps) {
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
    screen,
    setScreen,
  ] =
    useState<EventExperienceScreen>(
      "card"
    );


  /* ==========================================================================
     Template
  ========================================================================== */

const definition =
  getEventExperienceTemplate(
    data.type,
    templateId
  );

  if (
    !definition
  ) {
    return null;
  }

  const Card =
    definition.component;

  const template =
    definition.config;

  const invitation =
    data.invitation;

  const envelopeId =
    template.envelopeId;

  const cardAspectRatio =
    template.card.aspectRatio;

  const cardOrientation =
    getEventExperienceCardOrientation(
      cardAspectRatio
    );


  /* ==========================================================================
     Experience Type
  ========================================================================== */

  const isInvitation =
    data.type ===
      "invitation";

  const isPhotoWall =
    data.type ===
      "photo-wall";


  /* ==========================================================================
     Capabilities
  ========================================================================== */

  const hasEnvelope =
    envelopeId !==
      null;

  const hasDetails =
    isInvitation &&
    template.features.details;

  const hasRsvp =
    isInvitation &&
    template.features.rsvp &&
    data.content.rsvp.enabled &&
    invitation !==
      undefined;

  const hasPhotos =
    isPhotoWall &&
    template.features.photos;

  const hasActions =
    hasDetails ||
    hasRsvp ||
    hasPhotos;


  /* ==========================================================================
     RSVP Preview
  ========================================================================== */

  const rsvpPreviewState =
    invitation?.rsvpPreviewState ??
    "form";

  const rsvpPreviewMode =
    invitation?.rsvpPreviewMode ??
    "personalized";


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handleDetails() {
    if (
      !hasDetails
    ) {
      return;
    }

    setScreen(
      "details"
    );
  }

  function handleRsvp() {
    if (
      !hasRsvp
    ) {
      return;
    }

    setScreen(
      "rsvp"
    );
  }

  function handlePhotos() {
    if (
      !hasPhotos
    ) {
      return;
    }

    setScreen(
      "photos"
    );
  }

  function handleBackToCard() {
    setScreen(
      "card"
    );
  }


  /* ==========================================================================
     Card
  ========================================================================== */

  const card = (
    <EventExperiencePresentationProvider
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
    </EventExperiencePresentationProvider>
  );


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const photoWallPhotos =
    mode ===
      "preview"
      ? previewPhotoWallPhotos
      : buildPhotoWallGalleryPhotos(
          data.photoWall?.photos ??
            []
        );

  const photoWall = (
    <PhotoWallExperience
      publicId={
        data.publicId ??
        null
      }
      primaryName={
        data.content.hero.primary_name
      }
      secondaryName={
        data.content.hero.secondary_name
      }
      date={
        data.display.date.hasDate
          ? data.display.date.formatted
          : null
      }
      photos={
        photoWallPhotos
      }
      onBack={
        handleBackToCard
      }
    />
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
          !hasDetails
        ) {
          return card;
        }

        return (
          <EventExperienceEditorPreviewContainer>
            <InvitationDetailsView
              data={
                data
              }
            />
          </EventExperienceEditorPreviewContainer>
        );

      case "rsvp":
        if (
          !hasRsvp ||
          !invitation
        ) {
          return card;
        }

        return (
          <EventExperienceEditorPreviewContainer>
            {data.content.rsvp.allow_generic_responses &&
              invitation.onRsvpPreviewModeChange && (
                <InvitationRSVPPreviewMode
                  value={
                    rsvpPreviewMode
                  }
                  onChange={
                    invitation.onRsvpPreviewModeChange
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
                invitation.onSubmitRsvp
              }
              onGenericSubmit={
                invitation.onSubmitGenericRsvp
              }
            />
          </EventExperienceEditorPreviewContainer>
        );

      case "design":
      default:
        return card;
    }
  }


  /* ==========================================================================
     Experience Screen
  ========================================================================== */

  function renderExperienceScreen() {
    switch (
      screen
    ) {
      case "details":
        if (
          !hasDetails
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
          !hasRsvp ||
          !invitation
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
              invitation.onSubmitRsvp
            }
            onGenericSubmit={
              invitation.onSubmitGenericRsvp
            }
          />
        );

      case "photos":
        if (
          !hasPhotos
        ) {
          return card;
        }

        return photoWall;

      case "card":
      default:
        if (
          !hasEnvelope
        ) {
          return (
            <EventExperienceCardStage>
              {card}

              {hasPhotos && (
                <PhotoWallActions
                  onPhotos={
                    handlePhotos
                  }
                />
              )}
            </EventExperienceCardStage>
          );
        }

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
              hasActions
                ? (
                    <>
                      {isInvitation && (
                        <InvitationGuestActions
                          onDetails={
                            hasDetails
                              ? handleDetails
                              : undefined
                          }
                          onRsvp={
                            hasRsvp
                              ? handleRsvp
                              : undefined
                          }
                        />
                      )}

                      {hasPhotos && (
                        <PhotoWallActions
                          onPhotos={
                            handlePhotos
                          }
                        />
                      )}
                    </>
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
    <EventExperience
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
      {mode ===
        "edit"
        ? renderEditorScreen()
        : renderExperienceScreen()}
    </EventExperience>
  );
}