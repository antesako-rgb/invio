import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import {
  getEventExperienceEditorFallbackContent,
} from "@/features/invitations/editor/data/EventExperienceEditorFallbackContent";

import type {
  EventExperienceEditorEventFallback,
  EventExperienceEditorEventTranslations,
  EventExperienceEditorFallbackTranslations,
} from "@/features/invitations/editor/data/EventExperienceEditorFallback.types";


/* ==========================================================================
   Helpers
========================================================================== */

function fallbackString(
  value:
    string | null,

  fallback:
    string | null
): string | null {
  if (
    value !== null &&
    value.trim() !== ""
  ) {
    return value;
  }

  return fallback;
}


/* ==========================================================================
   Build Event Experience Editor Content
========================================================================== */

export function buildEventExperienceEditorContent(
  content:
    EventExperienceContent,

  translations:
    EventExperienceEditorFallbackTranslations,

  eventTranslations:
    EventExperienceEditorEventTranslations,

  eventFallback:
    EventExperienceEditorEventFallback
): EventExperienceContent {
  const fallback =
    getEventExperienceEditorFallbackContent(
      translations,
      eventTranslations,
      eventFallback
    );

  return {
    ...content,

    hero: {
      ...content.hero,

      primary_name:
        fallbackString(
          content.hero.primary_name,
          fallback.hero.primary_name
        ),

      secondary_name:
        fallbackString(
          content.hero.secondary_name,
          fallback.hero.secondary_name
        ),

      title:
        fallbackString(
          content.hero.title,
          fallback.hero.title
        ),

      subtitle:
        fallbackString(
          content.hero.subtitle,
          fallback.hero.subtitle
        ),

      first_initial:
        fallbackString(
          content.hero.first_initial,
          fallback.hero.first_initial
        ),

      second_initial:
        fallbackString(
          content.hero.second_initial,
          fallback.hero.second_initial
        ),
    },

    description:
      fallbackString(
        content.description,
        fallback.description
      ),

    date: {
      start_date:
        fallbackString(
          content.date.start_date,
          fallback.date.start_date
        ),

      end_date:
        fallbackString(
          content.date.end_date,
          fallback.date.end_date
        ),
    },

    time: {
      start_time:
        fallbackString(
          content.time.start_time,
          fallback.time.start_time
        ),

      end_time:
        fallbackString(
          content.time.end_time,
          fallback.time.end_time
        ),
    },

    location: {
      name:
        fallbackString(
          content.location.name,
          fallback.location.name
        ),

      address:
        fallbackString(
          content.location.address,
          fallback.location.address
        ),
    },

    rsvp: {
      ...content.rsvp,

      enabled:
        content.rsvp.enabled ??
        fallback.rsvp.enabled,

      title:
        fallbackString(
          content.rsvp.title,
          fallback.rsvp.title
        ),

      description:
        fallbackString(
          content.rsvp.description,
          fallback.rsvp.description
        ),

      deadline:
        content.rsvp.deadline,

      success_message:
        content.rsvp.success_message,

      questions:
        content.rsvp.questions ?? [],
    },

    program:
      content.program.length > 0
        ? content.program
        : fallback.program,

    contacts:
      content.contacts.length > 0
        ? content.contacts
        : fallback.contacts,

    media:
      content.media,

    music:
      content.music,
  };
}