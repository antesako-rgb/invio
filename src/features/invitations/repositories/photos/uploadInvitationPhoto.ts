import { z } from "zod";
import {
  randomUUID,
} from "crypto";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  deleteFromBunny,
  uploadToBunny,
} from "@/lib/upload/bunny";

import {
  optimizeImage,
} from "@/lib/upload/optimizeImage";

import {
  validateImage,
} from "@/lib/upload/validateImage";


/* ==========================================================================
   Upload Invitation Photo
========================================================================== */

export async function uploadInvitationPhoto(
  invitationId: string,
  file: File,
  description = ""
) {
  const validatedDescription = z.string().trim().max(300).parse(description);
  validateImage(
    file
  );

  const buffer =
    await optimizeImage({
      buffer:
        await file.arrayBuffer(),

      width:
        1600,

      quality:
        85,
    });

  const imagePath =
    `invitations/${invitationId}/${randomUUID()}.webp`;

  const bytes =
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset +
        buffer.byteLength
    ) as ArrayBuffer;

  await uploadToBunny(
    bytes,
    imagePath,
    "image/webp"
  );

  const supabase =
    await createServerClient();

  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "create_invitation_photo",
        {
          p_description: validatedDescription || undefined,
          p_invitation_id:
            invitationId,

          p_image_path:
            imagePath,

          p_file_size:
            buffer.byteLength,
        }
      );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Photo was not created"
      );
    }

    return data;
  } catch (error) {
    const {
      data: existingPhoto,
      error: lookupError,
    } =
      await supabase
        .from(
          "project_photos"
        )
        .select(
          "id"
        )
        .eq(
          "image_path",
          imagePath
        )
        .maybeSingle();

    if (
      !lookupError
      && !existingPhoto
    ) {
      try {
        await deleteFromBunny(
          imagePath
        );
      } catch {
        console.error(
          "Invitation upload cleanup failed",
          {
            invitationId,
          }
        );
      }
    }

    throw error;
  }
}