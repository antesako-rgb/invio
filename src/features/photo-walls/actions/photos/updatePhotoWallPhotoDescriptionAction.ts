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

import {
  requireProjectOwner,
} from "@/features/projects/repositories/requireProjectOwner";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

/* ==========================================================================
   Server Action
========================================================================== */

export async function updatePhotoWallPhotoDescriptionAction(
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
    ) || null;
    const supabase = await createServerClient();
    const { data: product, error: productError } = await supabase.from(
      "photo_walls"
    ).select(
      "project_id"
    ).eq(
      "id",
      productId
    ).single();
    if (productError || !product)
      return {
        success:
          false,

        code:
          "NOT_FOUND",
      };
    await requireProjectOwner(
      product.project_id
    );
    const { data, error } = await supabase.from(
      "photo_wall_photos"
    ).update(
      {
        description,
      }
    )
      .eq("photo_wall_id", productId).eq("photo_id", photoId).select("description").single();
    if (error || !data)
      return {
        success:
          false,

        code:
          "PHOTO_DESCRIPTION_FAILED",
      };
    revalidatePath(
      "/[locale]/photo-wall/[publicId]",
      "page"
    );
    return {
      success:
        true,

      data,
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
