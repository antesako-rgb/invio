import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import {
  buildEventExperienceDateDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceDateDisplay";

import {
  buildEventExperienceLocationDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceLocationDisplay";

import {
  buildEventExperienceTimeDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceTimeDisplay";

import {
  eventExperiencePreviewContentRegistry,
} from "@/features/invitations/preview/data/eventExperiencePreviewContentRegistry";

import {
  getEventExperienceTemplate,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  INVITATION_EDITOR_PREVIEW_GUESTS,
} from "@/features/invitations/editor/data/InvitationEditorPreviewGuests";

import type {
  EventExperienceRenderData,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Constants
========================================================================== */

const EVENT_EXPERIENCE_PREVIEW_TIMEZONE =
  "Europe/Zagreb";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePreviewProps {
  type:
    EventExperienceType;

  templateId:
    string;

  variantId:
    string;

  locale:
    string;
}


/* ==========================================================================
   Event Experience Preview
========================================================================== */

export default function EventExperiencePreview({
  type,
  templateId,
  variantId,
  locale,
}: EventExperiencePreviewProps) {
  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    getEventExperienceTemplate(
      type,
      templateId
    );

  if (
    !template
  ) {
    return null;
  }

  const config =
    template.config;


  /* ==========================================================================
     Preview Content
  ========================================================================== */

  const previewContent =
    eventExperiencePreviewContentRegistry[
      config.category
    ]?.[
      type
    ];

  if (
    !previewContent
  ) {
    return null;
  }


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const data:
    EventExperienceRenderData = {
      type,

      content:
        previewContent,

      presentation:
        {},

      display: {
        date:
          buildEventExperienceDateDisplay(
            previewContent.date,
            locale
          ),

        time:
          buildEventExperienceTimeDisplay(
            previewContent.time
          ),

        location:
          buildEventExperienceLocationDisplay(
            previewContent.location
          ),
      },

      eventTimezone:
        EVENT_EXPERIENCE_PREVIEW_TIMEZONE,

      invitation:
        config.features.rsvp &&
        type ===
          "invitation"
          ? {
              guests:
                INVITATION_EDITOR_PREVIEW_GUESTS,
            }
          : undefined,
    };


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventExperienceRenderer
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      mode="preview"
      data={
        data
      }
    />
  );
}