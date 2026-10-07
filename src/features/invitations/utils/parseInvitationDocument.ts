import {
  z,
} from "zod";
import { invitationEventDateSchema, invitationEventTimeSchema, normalizeInvitationDateTime } from "./invitationSharedDateTime";
import { invitationRsvpSchema } from "./invitationRsvp";

import {
  getInvitationLayout,
  isInvitationLayout,
} from "../config/invitationLayouts";

import {
  getInvitationPageType,
  invitationContentFields,
  isInvitationPageType,
} from "../config/invitationPageTypes";

import {
  invitationThemes,
} from "../config/invitationThemes";

import type {
  InvitationDocument,
} from "../types/invitationDocument.types";


/* ==========================================================================
   Schemas
========================================================================== */

const invitationPhotoSlotSchema =
  z
    .object({
      position: z.object({
        x: z.number().finite().min(0).max(1),
        y: z.number().finite().min(0).max(1),
      }).strict().optional(),
      fit: z.enum(["cover", "contain"]).optional(),
      id:
        z.string()
          .uuid(),

      photoId:
        z.string()
          .uuid()
          .nullable(),
    })
    .strict();

const invitationPageSchema =
  z
    .object({
      id:
        z.string()
          .uuid(),

      type:
        z.string()
          .refine(
            isInvitationPageType
          ),

      layout:
        z.preprocess(
          value => value === "centered" || value === "minimal" || value === "framed"
            ? "timeline"
            : value,
          z.string().refine(isInvitationLayout),
        ),

      layoutVersion:
        z.literal(1),

      content:
        z.record(
          z.enum(
            invitationContentFields
          ),
          z.string()
            .max(10000)
        ),

      photos:
        z
          .array(
            invitationPhotoSlotSchema
          )
          .max(20),
      rsvp: invitationRsvpSchema.optional(),

      unplacedPhotos:
        z
          .array(
            invitationPhotoSlotSchema
          )
          .max(100)
          .optional(),

      // Optional for legacy documents. Unknown identifiers survive round trips;
      // the renderer resolves them to a compatible default design.
      variant:
        z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    })
    .strict();

const invitationDocumentSchema =
  z
    .object({
      eventDate: invitationEventDateSchema.nullable().optional(),
      eventTime: invitationEventTimeSchema.nullable().optional(),
      legacyDateTime: z.object({ date: z.literal(true).optional(), time: z.literal(true).optional() }).strict().optional(),
      theme:
        z.enum(
          invitationThemes
        ),

      pages:
        z
          .array(
            invitationPageSchema
          )
          .max(100),
    })
    .strict();


/* ==========================================================================
   Parse Invitation Document
========================================================================== */

export function parseInvitationDocument(
  value: unknown
): InvitationDocument {
  const document =
    invitationDocumentSchema.parse(
      value
    );

  const ids =
    new Set<string>();
  if (document.pages.filter(page => page.type === "rsvp").length > 1) throw new Error("Only one RSVP section is allowed");

  for (
    const page
    of document.pages
  ) {
    if (
      !isInvitationPageType(
        page.type
      )
      || !isInvitationLayout(
        page.layout
      )
    ) {
      throw new Error(
        "Unsupported Invitation page"
      );
    }

    // Older covers may use the retired text designs or Timeline.
    // Ornamental also has zero slots, so content and retained photos stay intact.
    if (page.type === "cover" && page.layout === "timeline") {
      page.layout = "ornamental";
      page.variant = "default";
    }

    const pageType =
      getInvitationPageType(
        page.type
      );

    if (
      !pageType.layouts.includes(
        page.layout
      )
    ) {
      throw new Error(
        "Layout does not belong to page type"
      );
    }

    // Preserve the fourth photograph from the original Photo Strip design.
    if (page.layout === "photo-strip" && page.photos.length === 4) {
      const extra = page.photos.splice(3);
      page.unplacedPhotos = [...extra, ...(page.unplacedPhotos ?? [])];
    }

    const layout =
      getInvitationLayout(
        page.layout
      );

    if (
      page.photos.length !==
        layout.photoSlotCount
    ) {
      throw new Error(
        "Invalid photo slots"
      );
    }

    const items = [
      page,
      ...page.photos,
      ...(page.unplacedPhotos ?? []),
      ...(page.rsvp?.questions ?? []),
    ];
    if (page.rsvp && page.type !== "rsvp") throw new Error("RSVP configuration requires an RSVP page");

    for (
      const item
      of items
    ) {
      if (
        ids.has(
          item.id
        )
      ) {
        throw new Error(
          "Duplicate Invitation ID"
        );
      }

      ids.add(
        item.id
      );
    }
  }

  return normalizeInvitationDateTime(document as InvitationDocument);
}


/* ==========================================================================
   Assert Invitation Version
========================================================================== */

export function assertInvitationVersion(
  version: number
) {
  if (
    version !== 1
  ) {
    throw new Error(
      "Unsupported Invitation document version"
    );
  }
}
