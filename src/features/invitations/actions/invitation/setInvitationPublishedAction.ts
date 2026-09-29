"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  getInvitation,
} from "../../repositories/invitation/getInvitation";

import {
  publishInvitation,
} from "../../repositories/invitation/publishInvitation";

import {
  unpublishInvitation,
} from "../../repositories/invitation/unpublishInvitation";

import {
  getInvitationPhotos,
} from "../../repositories/photos/getInvitationPhotos";

import {
  invitationPhotoIds,
} from "../../utils/invitationDocumentOperations";

import {
  parseInvitationDocument,
} from "../../utils/parseInvitationDocument";


/* ==========================================================================
   Types
========================================================================== */

type PublishedInvitationActionData =
  Awaited<ReturnType<typeof publishInvitation>>;

/* ==========================================================================
   Set Invitation Published Action
========================================================================== */

export async function setInvitationPublishedAction(
  invitationId: string,
  published: boolean
): Promise<ActionResult<PublishedInvitationActionData>> {
  try {
    const invitation =
      await getInvitation(
        invitationId
      );

    if (!invitation) {
      throw new Error(
        "Invitation not found."
      );
    }

    if (published) {
      const document =
        parseInvitationDocument(
          invitation.document
        );

      if (
        document.pages.length === 0
      ) {
        return {
          success: false,
          message:
            "Invitation has no pages.",
        };
      }

      const photos =
        await getInvitationPhotos(
          invitationId
        );

      const photoIds =
        new Set(
          photos.map(
            (photo) =>
              photo.photo_id
          )
        );

      const hasMissingPhoto =
        invitationPhotoIds(
          document
        ).some(
          (photoId) =>
            !photoIds.has(
              photoId
            )
        );

      if (hasMissingPhoto) {
        return {
          success: false,
          message:
            "Invitation contains a missing photo.",
        };
      }

    }

    const data = published
      ? await publishInvitation(invitationId)
      : await unpublishInvitation(invitationId);

    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    revalidatePath(
      "/[locale]/invitation/[publicId]",
      "page"
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
          : "Invitation publication failed.",
    };
  }
}