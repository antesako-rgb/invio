import {
  z,
} from "zod";


/* ==========================================================================
   Photo Wall Photos Page
========================================================================== */

export const photoWallPhotosPageSchema =
  z.object({
    photoWallId:
      z.string().uuid(),

    filter:
      z
        .enum([
          "all",
          "favorites",
        ])
        .optional(),

    cursor:
      z
        .object({
          id:
            z.string().uuid(),

          createdAt:
            z
              .string()
              .datetime({
                offset: true,
              }),
        })
        .nullable()
        .optional(),

    excludedPhotoIds:
      z
        .array(
          z.string().uuid()
        )
        .optional(),
  });