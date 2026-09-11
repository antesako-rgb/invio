import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  EventExperienceRenderData,
} from "@/features/invitations/types/eventExperienceRenderer.types";

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
  parseEventExperienceContent,
} from "@/features/invitations/renderer/parsers/parseEventExperienceContent";

import {
  parseEventExperiencePresentation,
} from "@/features/invitations/renderer/parsers/parseEventExperiencePresentation";


/* ==========================================================================
   Types
========================================================================== */

interface BuildEventExperienceRenderDataInput {
  experience: {
    type:
      EventExperienceType;

    content:
      Json;

    presentation:
      Json;
  };

  locale:
    string;

  eventTimezone:
    string;

  publicId?:
    string;
}


/* ==========================================================================
   Build Event Experience Render Data
========================================================================== */

export function buildEventExperienceRenderData({
  experience,
  locale,
  eventTimezone,
  publicId,
}: BuildEventExperienceRenderDataInput): EventExperienceRenderData {
  const content =
    parseEventExperienceContent(
      experience.content
    );

  const presentation =
    parseEventExperiencePresentation(
      experience.presentation
    );

  return {
    type:
      experience.type,

    publicId,

    content,

    presentation,

    display: {
      date:
        buildEventExperienceDateDisplay(
          content.date,
          locale
        ),

      time:
        buildEventExperienceTimeDisplay(
          content.time
        ),

      location:
        buildEventExperienceLocationDisplay(
          content.location
        ),
    },

    eventTimezone,
  };
}