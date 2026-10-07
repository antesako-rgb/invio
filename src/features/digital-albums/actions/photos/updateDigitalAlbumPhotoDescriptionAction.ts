"use server";

import {
  z,
} from "zod";

import {
  revalidatePath,
} from "next/cache";

import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

/* ==========================================================================
   Server Action
========================================================================== */

export async function updateDigitalAlbumPhotoDescriptionAction(
  productId:
    string,

  photoId:
    string,

  value:
    string
): Promise<ActionResult<{
  description: string | null;
}>> {
  try {
    z.string().uuid().parse(
      productId
    );
    z.string().uuid().parse(
      photoId
    );
    const description = z.string().trim().max(
      300
    ).parse(
      value
    );
    const supabase = await createServerClient();
    // The RPC verifies project membership and photo ownership within this product.
    const { data, error } = await supabase.rpc("update_digital_album_photo", {
      p_album_id:
        productId,

      p_photo_id:
        photoId,

      p_description:
        description,
    });
    if (error || !data)
      return {
        success:
          false,

        code:
          "PHOTO_DESCRIPTION_FAILED",
      };
    revalidatePath(
      "/[locale]/album/[publicId]",
      "page"
    );
    return {
      success:
        true,

      data: {
        description:
          data.description,
      },
    };
  } catch {
    return {
      success:
        false,

      code:
        "PHOTO_DESCRIPTION_FAILED",
    };
  }
}
