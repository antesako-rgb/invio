import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import {
  getInvitationEditorFallbackContent,
} from "@/features/invitations/editor/data/getInvitationEditorFallbackContent";

import type {
  InvitationEditorFallbackTranslations,
} from "@/features/invitations/editor/data/getInvitationEditorFallbackContent";


/* ==========================================================================
   Helpers
========================================================================== */

function fallbackString(
  value: string | null,
  fallback: string | null
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
   Build Invitation Editor Content
========================================================================== */

export function buildInvitationEditorContent(
  content: InvitationContent,
  translations: InvitationEditorFallbackTranslations
): InvitationContent {
  const fallback =
    getInvitationEditorFallbackContent(
      translations
    );

  return {
    ...content,

    hero: {
      ...content.hero,

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

      callout_subtitle:
        fallbackString(
          content.rsvp.callout_subtitle,
          fallback.rsvp.callout_subtitle
        ),

      callout_note:
        fallbackString(
          content.rsvp.callout_note,
          fallback.rsvp.callout_note
        ),
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