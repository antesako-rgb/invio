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
   Upload Event Experience Image
========================================================================== */

export async function uploadEventExperienceImage(
  file: File,
  experienceId: string
): Promise<string> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Authentication
  ========================================================================== */

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
     Event Experience Access
  ========================================================================== */

  const {
    data: experience,
    error: experienceError,
  } =
    await supabase
      .from("invitations")
      .select("id")
      .eq(
        "id",
        experienceId
      )
      .single();

  if (
    experienceError ||
    !experience
  ) {
    throw new Error(
      "Event experience nije pronađen ili nemate dopuštenje za pristup."
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
      experienceId,
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