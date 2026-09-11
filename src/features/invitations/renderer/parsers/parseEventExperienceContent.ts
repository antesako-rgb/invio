import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import {
  parseInvitationRsvpContent,
} from "@/features/invitations/renderer/parsers/parseInvitationRsvpContent";


/* ==========================================================================
   Helpers
========================================================================== */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


/* ==========================================================================
   Parse Event Experience Content
========================================================================== */

export function parseEventExperienceContent(
  content: Json
): EventExperienceContent {
  const value =
    isRecord(
      content
    )
      ? content
      : {};

  const hero =
    isRecord(
      value.hero
    )
      ? value.hero
      : {};

  const date =
    isRecord(
      value.date
    )
      ? value.date
      : {};

  const time =
    isRecord(
      value.time
    )
      ? value.time
      : {};

  const location =
    isRecord(
      value.location
    )
      ? value.location
      : {};

  const media =
    isRecord(
      value.media
    )
      ? value.media
      : {};

  const music =
    isRecord(
      value.music
    )
      ? value.music
      : {};

  return {
    hero: {
      primary_name:
        typeof hero.primary_name ===
          "string"
          ? hero.primary_name
          : null,

      secondary_name:
        typeof hero.secondary_name ===
          "string"
          ? hero.secondary_name
          : null,

      title:
        typeof hero.title ===
          "string"
          ? hero.title
          : null,

      subtitle:
        typeof hero.subtitle ===
          "string"
          ? hero.subtitle
          : null,

      first_initial:
        typeof hero.first_initial ===
          "string"
          ? hero.first_initial
          : null,

      second_initial:
        typeof hero.second_initial ===
          "string"
          ? hero.second_initial
          : null,
    },

    description:
      typeof value.description ===
        "string"
        ? value.description
        : null,

    date: {
      start_date:
        typeof date.start_date ===
          "string"
          ? date.start_date
          : null,

      end_date:
        typeof date.end_date ===
          "string"
          ? date.end_date
          : null,
    },

    time: {
      start_time:
        typeof time.start_time ===
          "string"
          ? time.start_time
          : null,

      end_time:
        typeof time.end_time ===
          "string"
          ? time.end_time
          : null,
    },

    location: {
      name:
        typeof location.name ===
          "string"
          ? location.name
          : null,

      address:
        typeof location.address ===
          "string"
          ? location.address
          : null,
    },

    program:
      Array.isArray(
        value.program
      )
        ? value.program.flatMap(
            (
              item,
              index
            ) => {
              if (
                !isRecord(
                  item
                ) ||
                typeof item.title !==
                  "string"
              ) {
                return [];
              }

              return [
                {
                  id:
                    typeof item.id ===
                      "string"
                      ? item.id
                      : `program-${index}`,

                  date:
                    typeof item.date ===
                      "string"
                      ? item.date
                      : null,

                  title:
                    item.title,

                  description:
                    typeof item.description ===
                      "string"
                      ? item.description
                      : null,

                  start_time:
                    typeof item.start_time ===
                      "string"
                      ? item.start_time
                      : null,

                  end_time:
                    typeof item.end_time ===
                      "string"
                      ? item.end_time
                      : null,

                  location_name:
                    typeof item.location_name ===
                      "string"
                      ? item.location_name
                      : null,

                  address:
                    typeof item.address ===
                      "string"
                      ? item.address
                      : null,
                },
              ];
            }
          )
        : [],

    rsvp:
      parseInvitationRsvpContent(
        value.rsvp
      ),

    contacts:
      Array.isArray(
        value.contacts
      )
        ? value.contacts.flatMap(
            (item) => {
              if (
                !isRecord(
                  item
                ) ||
                typeof item.name !==
                  "string"
              ) {
                return [];
              }

              return [
                {
                  name:
                    item.name,

                  phone:
                    typeof item.phone ===
                      "string"
                      ? item.phone
                      : null,

                  email:
                    typeof item.email ===
                      "string"
                      ? item.email
                      : null,
                },
              ];
            }
          )
        : [],

    media: {
      image_url:
        typeof media.image_url ===
          "string"
          ? media.image_url
          : null,
    },

    music: {
      enabled:
        typeof music.enabled ===
          "boolean"
          ? music.enabled
          : false,

      audio_url:
        typeof music.audio_url ===
          "string"
          ? music.audio_url
          : null,
    },
  };
}