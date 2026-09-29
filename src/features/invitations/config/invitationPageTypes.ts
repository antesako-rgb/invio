import type {
  InvitationLayout,
} from "./invitationLayouts";


/* ==========================================================================
   Content Fields
========================================================================== */

export const invitationContentFields = [
  "firstName",
  "secondName",
  "title",
  "subtitle",
  "text",
  "date",
  "time",
  "location",
  "address",
  "schedule",
  "contact",
] as const;

export type InvitationContentField =
  typeof invitationContentFields[number];


/* ==========================================================================
   Page Type Definition
========================================================================== */

interface PageTypeDefinition {
  layouts:
    readonly InvitationLayout[];

  fields:
    readonly InvitationContentField[];

  optionalFields?:
    readonly InvitationContentField[];
}


/* ==========================================================================
   Invitation Page Types
========================================================================== */

export const invitationPageTypes = {
cover: {
  layouts: [
      "full-photo",
      "ornamental",
      "poster",
      "torn-paper",
      "portrait-cover",
      "photo-strip",
    ],

  fields: [
    "title",
    "subtitle",
    "date",
  ],
},

  story: {
    layouts: [
      "editorial",
      "timeline",
      "photo-text",
    ],

    fields: [
      "title",
      "subtitle",
      "text",
    ],
  },

  details: {
    layouts: [
      "timeline",
      "split",
      "photo-left",
      "date-card",
      "calendar",
    ],

    fields: [
      "title",
      "text",
      "date",
      "time",
      "location",
      "address",
    ],

    optionalFields: [
      "text",
    ],
  },

  schedule: {
    layouts: [
      "timeline",
    ],

    fields: [
      "title",
      "subtitle",
      "schedule",
    ],
  },

  gallery: {
    layouts: [
      "grid",
      "full-photo",
    ],

    fields: [
      "title",
      "subtitle",
      "text",
    ],

    optionalFields: [
      "text",
    ],
  },

  rsvp: {
    layouts: [
      "timeline",
    ],

    fields: [
      "title",
      "text",
      "contact",
    ],
  },

  closing: {
    layouts: [
      "timeline",
      "full-photo",
    ],

    fields: [
      "title",
      "subtitle",
      "text",
    ],
  },
} as const satisfies
  Record<
    string,
    PageTypeDefinition
  >;


/* ==========================================================================
   Types
========================================================================== */

export type InvitationPageType =
  keyof typeof invitationPageTypes;


/* ==========================================================================
   Helpers
========================================================================== */

export function isInvitationPageType(
  value: string
): value is InvitationPageType {
  return Object.hasOwn(
    invitationPageTypes,
    value
  );
}

export function getInvitationPageType(
  type: InvitationPageType
): PageTypeDefinition {
  return invitationPageTypes[
    type
  ];
}
