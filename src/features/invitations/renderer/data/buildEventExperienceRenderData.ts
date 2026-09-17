import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";
import type {
  Locale,
} from "@/i18n/config";
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

import {
  buildPublicEventExperienceUrl,
} from "@/features/invitations/utils/buildPublicEventExperienceUrl";


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
    Locale;

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

const publicUrl =
  publicId
    ? buildPublicEventExperienceUrl(
        locale,
        experience.type,
        publicId
      )
    : undefined;

  return {
    type:
      experience.type,

    publicId,

    publicUrl,

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