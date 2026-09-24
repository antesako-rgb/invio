import {
  z,
} from "zod";

import {
  DIGITAL_ALBUM_LAYOUT_IDS,
  getDigitalAlbumLayout,
} from "../config/digitalAlbumLayouts";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageLayout,
} from "../types/digitalAlbumDocument.types";


/* ==========================================================================
   Schemas
========================================================================== */

const id =
  z
    .string()
    .min(1);


const slot =
  z
    .object({
      id,

      photoId:
        z
          .string()
          .nullable(),

      position:
        z
          .object({
            x:
              z
                .number()
                .finite()
                .min(0)
                .max(1),

            y:
              z
                .number()
                .finite()
                .min(0)
                .max(1),
          })
          .strict()
          .optional(),

      fit:
        z
          .enum([
            "cover",
            "contain",
          ])
          .optional(),

      caption:
        z
          .string()
          .optional(),
    })
    .strict();


const page =
  z
    .object({
      id,

      layout:
        z.custom<DigitalAlbumPageLayout>(
          (value) =>
            DIGITAL_ALBUM_LAYOUT_IDS.includes(
              value as DigitalAlbumPageLayout
            )
        ),

      layoutVersion:
        z
          .union([
            z.literal(1),
            z.literal(2),
          ])
          .optional(),

      photos:
        z.array(
          slot
        ),

      unplacedPhotos:
        z
          .array(
            slot
          )
          .optional(),

      content:
        z
          .object({
            title:
              z
                .string()
                .optional(),

            subtitle:
              z
                .string()
                .optional(),

            text:
              z
                .string()
                .optional(),

            date:
              z
                .string()
                .optional(),
          })
          .strict(),
    })
    .strict()
    .superRefine(
      (
        value,
        ctx
      ) => {
        const definition =
          getDigitalAlbumLayout(
            value.layout
          );

        if (!definition) {
          return;
        }

        if (
          value.photos.length !==
          definition.photoSlotCount
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Incorrect photo slot count",
          });
        }

        if (
          !definition.legacy &&
          value.layoutVersion !== 2
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Unsupported layout version",
          });
        }

        const ids = [
          ...value.photos,
          ...(value.unplacedPhotos ?? []),
        ].map(
          (photo) =>
            photo.id
        );

        if (
          new Set(
            ids
          ).size !==
          ids.length
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Duplicate slot IDs",
          });
        }
      }
    );


const schema =
  z
    .object({
      theme:
        z.literal(
          "classic"
        ),

      pages:
        z.array(
          page
        ),
    })
    .strict()
    .superRefine(
      (
        value,
        ctx
      ) => {
        const pageIds =
          value.pages.map(
            (page) =>
              page.id
          );

        if (
          new Set(
            pageIds
          ).size !==
          pageIds.length
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Duplicate page IDs",
          });
        }
      }
    );


/* ==========================================================================
   Parse Digital Album Document
========================================================================== */

export function parseDigitalAlbumDocument(
  value:
    unknown
): DigitalAlbumDocument {
  return schema.parse(
    value
  );
}
