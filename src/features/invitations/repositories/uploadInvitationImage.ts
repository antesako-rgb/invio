import {
  randomUUID,
} from "crypto";

import {
  createServerClient,
} from "@/lib/supabase/server";
import {
  uploadToBunny,
} from "@/lib/upload/bunny";

import {
  buildInvitationImageFileName,
} from "@/lib/upload/buildFileName";

import {
  optimizeImage,
} from "@/lib/upload/optimizeImage";

import {
  validateImage,
} from "@/lib/upload/validateImage";


/* ==========================================================================
   Upload Invitation Image
========================================================================== */

export async function uploadInvitationImage(
  file: File,
  invitationId: string
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    throw new Error(
      "Prijava je obavezna."
    );
  }


  /* ==========================================================================
     Invitation Access
  ========================================================================== */

  const {
    data: invitation,
    error: invitationError,
  } =
    await supabase
      .from("invitations")
      .select("id")
      .eq(
        "id",
        invitationId
      )
      .single();

  if (
    invitationError ||
    !invitation
  ) {
    throw new Error(
      "Pozivnica nije pronađena ili nemate dopuštenje za pristup."
    );
  }


  /* ==========================================================================
     Validate Image
  ========================================================================== */

  validateImage(
    file
  );


  /* ==========================================================================
     Optimize Image
  ========================================================================== */

  const fileBuffer =
    await file.arrayBuffer();

  const optimizedBuffer =
    await optimizeImage({
      buffer:
        fileBuffer,

      width:
        1600,

      quality:
        85,
    });

  const optimizedArrayBuffer =
    optimizedBuffer.buffer.slice(
      optimizedBuffer.byteOffset,
      optimizedBuffer.byteOffset +
        optimizedBuffer.byteLength
    ) as ArrayBuffer;


  /* ==========================================================================
     Bunny Path
  ========================================================================== */

  const imageId =
    randomUUID();

  const path =
    buildInvitationImageFileName(
      invitationId,
      imageId
    );


  /* ==========================================================================
     Upload
  ========================================================================== */

  await uploadToBunny(
    optimizedArrayBuffer,
    path,
    "image/webp"
  );


  /* ==========================================================================
     CDN URL
  ========================================================================== */

  const cdnUrl =
    process.env.NEXT_PUBLIC_CDN_URL;

  if (!cdnUrl) {
    throw new Error(
      "CDN nije konfiguriran."
    );
  }

  return `${cdnUrl}/${path}`;
}