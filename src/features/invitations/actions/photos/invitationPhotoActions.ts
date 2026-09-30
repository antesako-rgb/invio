"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import type {
  InvitationPhotoWithPhoto,
} from "../../types/invitationPhoto.types";

import {
  addInvitationPhotos,
} from "../../repositories/photos/addInvitationPhotos";

import {
  getInvitationPhotos,
} from "../../repositories/photos/getInvitationPhotos";

import {
  getInvitationProjectPhotos,
} from "../../repositories/photos/getInvitationProjectPhotos";

import {
  removeInvitationPhoto,
} from "../../repositories/photos/removeInvitationPhoto";

import {
  uploadInvitationPhoto,
} from "../../repositories/photos/uploadInvitationPhoto";


/* ==========================================================================
   Types
========================================================================== */

type InvitationPhotosActionData = {
  photos: InvitationPhotoWithPhoto[];
};

type InvitationProjectPhotosActionData =
  Awaited<
    ReturnType<
      typeof getInvitationProjectPhotos
    >
  >;


/* ==========================================================================
   Upload Invitation Photo Action
========================================================================== */

export async function uploadInvitationPhotoAction(
  invitationId: string,
  file: File,
  description = ""
): Promise<
  ActionResult<InvitationPhotosActionData>
> {
  try {
    await uploadInvitationPhoto(
      invitationId,
      file,
      description
    );

    const photos =
      await getInvitationPhotos(
        invitationId
      );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );

    return {
      success: true,
      data: {
        photos,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Photo upload failed.",
    };
  }
}


/* ==========================================================================
   Add Invitation Photos Action
========================================================================== */

export async function addInvitationPhotosAction(
  invitationId: string,
  photoIds: string[]
): Promise<
  ActionResult<InvitationPhotosActionData>
> {
  try {
    await addInvitationPhotos(
      invitationId,
      photoIds
    );

    const photos =
      await getInvitationPhotos(
        invitationId
      );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );

    return {
      success: true,
      data: {
        photos,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Photos could not be added.",
    };
  }
}


/* ==========================================================================
   Remove Invitation Photo Action
========================================================================== */

export async function removeInvitationPhotoAction(
  invitationId: string,
  photoId: string
): Promise<
  ActionResult<InvitationPhotosActionData>
> {
  try {
    await removeInvitationPhoto(
      invitationId,
      photoId
    );

    const photos =
      await getInvitationPhotos(
        invitationId
      );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
    );

    return {
      success: true,
      data: {
        photos,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Photo removal failed.",
    };
  }
}


/* ==========================================================================
   Get Invitation Project Photos Action
========================================================================== */

export async function getInvitationProjectPhotosAction(
  invitationId: string,
  offset: number
): Promise<
  ActionResult<InvitationProjectPhotosActionData>
> {
  try {
    const data =
      await getInvitationProjectPhotos(
        invitationId,
        offset
      );

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Project photos could not be loaded.",
    };
  }
}