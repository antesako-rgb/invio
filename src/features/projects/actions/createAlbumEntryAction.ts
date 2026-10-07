"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createInitializedDigitalAlbum,
} from "@/features/digital-albums/services/createInitializedDigitalAlbum";


/* ==========================================================================
   Schema
========================================================================== */

const schema =
  z
    .object({
      name:
        z
            .string()
            .trim()
            .min(1)
            .max(150),

      projectId:
        z
            .string()
            .uuid(),
    })
    .strict();


/* ==========================================================================
   Types
========================================================================== */

interface CreateAlbumEntryData {
  albumId:
    string;

  projectId:
    string;
}

type CreateAlbumEntryResult =
  ActionResult<CreateAlbumEntryData, "INVALID_INPUT" | "ALBUM_CREATE_FAILED">;


/* ==========================================================================
   Create Album Entry Action
========================================================================== */

export async function createAlbumEntryAction(
  input:
    z.infer<typeof schema>
): Promise<CreateAlbumEntryResult> {
  const parsed =
    schema.safeParse(
      input
    );

  if (
    !parsed.success
  ) {
    return {
      success:
        false,

      code:
        "INVALID_INPUT",
    };
  }

  const projectId =
    parsed.data.projectId;

  try {
    const album =
      await createInitializedDigitalAlbum(
        projectId,
        parsed.data.name
      );

    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    return {
      success:
        true,

      data: {
        albumId:
          album.id,

        projectId,
      },
    };
  } catch {
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    return {
      success:
        false,

      code:
        "ALBUM_CREATE_FAILED",
    };
  }
}
