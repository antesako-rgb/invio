import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";


/* ==========================================================================
   Types
========================================================================== */

export type EventExperienceEditorElementType =
  | "text"
  | "date"
  | "time"
  | "image";


interface EventExperienceEditorElement {
  type:
    EventExperienceEditorElementType;

  labelKey:
    string;

  getValue:
    (
      content: EventExperienceContent
    ) => string | null;

  setValue:
    (
      content: EventExperienceContent,
      value: string
    ) => EventExperienceContent;
}


/* ==========================================================================
   Helpers
========================================================================== */

function normalizeTextValue(
  value: string
) {
  return value === ""
    ? null
    : value;
}


/* ==========================================================================
   Event Experience Editor Elements
========================================================================== */

export const eventExperienceEditorElements = {
  /* ==========================================================================
     Hero
  ========================================================================== */

  "hero.primary_name": {
    type:
      "text",

    labelKey:
      "primaryName",

    getValue:
      (
        content
      ) =>
        content.hero.primary_name,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          primary_name:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "hero.secondary_name": {
    type:
      "text",

    labelKey:
      "secondaryName",

    getValue:
      (
        content
      ) =>
        content.hero.secondary_name,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          secondary_name:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "hero.title": {
    type:
      "text",

    labelKey:
      "title",

    getValue:
      (
        content
      ) =>
        content.hero.title,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          title:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "hero.subtitle": {
    type:
      "text",

    labelKey:
      "subtitle",

    getValue:
      (
        content
      ) =>
        content.hero.subtitle,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          subtitle:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "hero.first_initial": {
    type:
      "text",

    labelKey:
      "initial",

    getValue:
      (
        content
      ) =>
        content.hero.first_initial,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          first_initial:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "hero.second_initial": {
    type:
      "text",

    labelKey:
      "initial",

    getValue:
      (
        content
      ) =>
        content.hero.second_initial,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        hero: {
          ...content.hero,

          second_initial:
            normalizeTextValue(
              value
            ),
        },
      }),
  },


  /* ==========================================================================
     Description
  ========================================================================== */

  "description": {
    type:
      "text",

    labelKey:
      "description",

    getValue:
      (
        content
      ) =>
        content.description,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        description:
          normalizeTextValue(
            value
          ),
      }),
  },


  /* ==========================================================================
     Date
  ========================================================================== */

  "date.start_date": {
    type:
      "date",

    labelKey:
      "date",

    getValue:
      (
        content
      ) =>
        content.date.start_date,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        date: {
          ...content.date,

          start_date:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "date.end_date": {
    type:
      "date",

    labelKey:
      "date",

    getValue:
      (
        content
      ) =>
        content.date.end_date,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        date: {
          ...content.date,

          end_date:
            normalizeTextValue(
              value
            ),
        },
      }),
  },


  /* ==========================================================================
     Time
  ========================================================================== */

  "time.start_time": {
    type:
      "time",

    labelKey:
      "time",

    getValue:
      (
        content
      ) =>
        content.time.start_time,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        time: {
          ...content.time,

          start_time:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "time.end_time": {
    type:
      "time",

    labelKey:
      "time",

    getValue:
      (
        content
      ) =>
        content.time.end_time,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        time: {
          ...content.time,

          end_time:
            normalizeTextValue(
              value
            ),
        },
      }),
  },


  /* ==========================================================================
     Location
  ========================================================================== */

  "location.name": {
    type:
      "text",

    labelKey:
      "location",

    getValue:
      (
        content
      ) =>
        content.location.name,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        location: {
          ...content.location,

          name:
            normalizeTextValue(
              value
            ),
        },
      }),
  },

  "location.address": {
    type:
      "text",

    labelKey:
      "address",

    getValue:
      (
        content
      ) =>
        content.location.address,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        location: {
          ...content.location,

          address:
            normalizeTextValue(
              value
            ),
        },
      }),
  },


  /* ==========================================================================
     Media
  ========================================================================== */

  "media.image_url": {
    type:
      "image",

    labelKey:
      "image",

    getValue:
      (
        content
      ) =>
        content.media.image_url,

    setValue:
      (
        content,
        value
      ) => ({
        ...content,

        media: {
          ...content.media,

          image_url:
            normalizeTextValue(
              value
            ),
        },
      }),
  },
} satisfies Record<
  string,
  EventExperienceEditorElement
>;


/* ==========================================================================
   Element Names
========================================================================== */

export type EventExperienceEditorElementName =
  keyof typeof eventExperienceEditorElements;