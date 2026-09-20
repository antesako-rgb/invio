"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createDigitalAlbum,
} from "@/features/digital-albums/repositories/album/createDigitalAlbum";

import type {
  CreateDigitalAlbumInput,
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Create Digital Album Action
========================================================================== */

export async function createDigitalAlbumAction(
  input:
    CreateDigitalAlbumInput
): Promise<ActionResult<DigitalAlbum>> {
  try {
    const album =
      await createDigitalAlbum(
        input
      );

    revalidatePath(
      `/dashboard/dogadaji/${input.eventId}/albumi`
    );

    return {
      success:
        true,

      data:
        album,
    };
  } catch (error) {
    console.error(
      "createDigitalAlbumAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće kreirati digitalni album.",
    };
  }
}