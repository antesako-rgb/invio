import type {
  InvitationLayout,
} from "../config/invitationLayouts";

import type {
  InvitationContentField,
  InvitationPageType,
} from "../config/invitationPageTypes";

import type {
  InvitationTheme,
} from "../config/invitationThemes";


/* ==========================================================================
   Types
========================================================================== */

type InvitationTemplatePage = {
  type: InvitationPageType;
  layout: InvitationLayout;
  variant?: string;
  copy: string;
  fields: readonly InvitationContentField[];
};

export type InvitationTemplate = {
  eventDate: string;
  eventTime: string;
  id: string;
  version: 1;
  category:
    | "wedding"
    | "birthday"
    | "business";
  theme: InvitationTheme;
  pages: readonly InvitationTemplatePage[];
};


/* ==========================================================================
   Invitation Templates
========================================================================== */

export const invitationTemplates = [
  {
    eventDate: "2027-06-14",
    eventTime: "16:00",
    id:
      "botanical",

    version:
      1,

    category:
      "wedding",

    theme:
      "botanical",

    pages: [
      {
        type: "cover",
        layout: "ornamental",
        variant: "watercolor",
        copy: "cover",
        fields: [
          "title",
          "subtitle",
          "date",
        ],
      },
      {
        type: "story",
        layout: "photo-text",
        copy: "story",
        fields: [
          "title",
          "text",
        ],
      },
      {
        type: "details",
        layout: "timeline",
        copy: "ceremony",
        fields: [
          "title",
          "time",
          "location",
          "address",
        ],
      },
      {
        type: "details",
        layout: "split",
        copy: "celebration",
        fields: [
          "title",
          "time",
          "location",
        ],
      },
      {
        type: "gallery",
        layout: "grid",
        copy: "gallery",
        fields: [
          "title",
          "subtitle",
        ],
      },
      {
        type: "rsvp",
        layout: "timeline",
        copy: "rsvp",
        fields: [
          "title",
          "text",
          "contact",
        ],
      },
      {
        type: "closing",
        layout: "timeline",
        copy: "closing",
        fields: [
          "title",
          "text",
        ],
      },
    ],
  },

  {
    id:
      "celebration",

    eventDate: "2027-08-21",
    eventTime: "18:00",

    version:
      1,

    category:
      "birthday",

    theme:
      "celebration",

    pages: [
      {
        type: "cover",
        layout: "full-photo",
        copy: "cover",
        fields: [
          "title",
          "subtitle",
          "date",
        ],
      },
      {
        type: "details",
        layout: "split",
        copy: "details",
        fields: [
          "title",
          "time",
          "location",
          "address",
        ],
      },
      {
        type: "gallery",
        layout: "grid",
        copy: "gallery",
        fields: [
          "title",
          "subtitle",
        ],
      },
      {
        type: "rsvp",
        layout: "timeline",
        copy: "rsvp",
        fields: [
          "title",
          "text",
          "contact",
        ],
      },
      {
        type: "closing",
        layout: "timeline",
        copy: "closing",
        fields: [
          "title",
          "text",
        ],
      },
    ],
  },

  {
    id:
      "conference",

    eventDate: "2027-10-08",
    eventTime: "10:00",

    version:
      1,

    category:
      "business",

    theme:
      "editorial",

    pages: [
      {
        type: "cover",
        layout: "ornamental",
        copy: "cover",
        fields: [
          "title",
          "subtitle",
          "date",
        ],
      },
      {
        type: "details",
        layout: "photo-left",
        copy: "details",
        fields: [
          "title",
          "text",
          "time",
          "location",
          "address",
        ],
      },
      {
        type: "schedule",
        layout: "timeline",
        copy: "schedule",
        fields: [
          "title",
          "schedule",
        ],
      },
      {
        type: "rsvp",
        layout: "timeline",
        copy: "rsvp",
        fields: [
          "title",
          "text",
          "contact",
        ],
      },
      {
        type: "closing",
        layout: "timeline",
        copy: "closing",
        fields: [
          "title",
          "text",
        ],
      },
    ],
  },
] as const satisfies
  readonly InvitationTemplate[];


/* ==========================================================================
   Types
========================================================================== */

export type InvitationTemplateId =
  typeof invitationTemplates[number]["id"];
