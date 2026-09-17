import {
  notFound,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  buildEventExperienceRenderData,
} from "@/features/invitations/renderer/data/buildEventExperienceRenderData";

import {
  buildInvitationRenderGuests,
} from "@/features/invitations/renderer/data/buildInvitationRenderGuests";

import {
  getPublicEventExperience,
} from "@/features/invitations/repositories/experience/getPublicEventExperience";

import {
  getPublicInvitationRecipient,
} from "@/features/invitations/repositories/invitation-recipients/getPublicInvitationRecipient";

import {
  getPublicPhotoWallPhotos,
} from "@/features/invitations/repositories/photo-wall/getPublicPhotoWallPhotos";

import GenericInvitationExperience
  from "@/features/invitations/components/invitation-experience/GenericInvitationExperience/GenericInvitationExperience";

import PersonalizedInvitationExperience
  from "@/features/invitations/components/invitation-experience/PersonalizedInvitationExperience/PersonalizedInvitationExperience";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface PublicEventExperiencePageProps {
  params:
    Promise<{
      locale:
        Locale;

      type:
        EventExperienceType;

      publicId:
        string;
    }>;
}


/* ==========================================================================
   Public Event Experience Page
========================================================================== */

export default async function PublicEventExperiencePage({
  params,
}: PublicEventExperiencePageProps) {
  const {
    locale,
    type,
    publicId,
  } =
    await params;


  /* ==========================================================================
     Personalized Invitation
  ========================================================================== */

  if (
    publicId.startsWith(
      "rcp_"
    )
  ) {
    if (
      type !==
        "invitation"
    ) {
      notFound();
    }

    const recipient =
      await getPublicInvitationRecipient({
        publicId,
      });

    if (
      !recipient ||
      recipient.invitation.type !==
        type
    ) {
      notFound();
    }

    const guests =
      buildInvitationRenderGuests(
        recipient.guests
      );

    const baseData =
      buildEventExperienceRenderData({
        experience:
          recipient.invitation,

        locale,

        eventTimezone:
          recipient.event.timezone,
      });

    const data = {
      ...baseData,

      invitation: {
        guests,
      },
    };

    return (
      <PersonalizedInvitationExperience
        recipientPublicId={
          publicId
        }
        templateId={
          recipient.invitation.template_id
        }
        variantId={
          recipient.invitation.variant_id
        }
        data={
          data
        }
      />
    );
  }


  /* ==========================================================================
     Generic Event Experience
  ========================================================================== */

  if (
    !publicId.startsWith(
      "inv_"
    )
  ) {
    notFound();
  }

  const experience =
    await getPublicEventExperience({
      publicId,
    });

  if (
    !experience ||
    experience.type !== type
  ) {
    notFound();
  }


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const photoWallPhotosPage =
    experience.type ===
      "photo-wall"
      ? await getPublicPhotoWallPhotos({
          publicId,
        })
      : undefined;


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const baseData =
    buildEventExperienceRenderData({
      experience,

      locale,

      eventTimezone:
        experience.event_timezone,

      publicId,
    });

  const data = {
    ...baseData,

    photoWall:
      photoWallPhotosPage
        ? {
            photos:
              photoWallPhotosPage.photos,

            nextCursor:
              photoWallPhotosPage.nextCursor,
          }
        : undefined,
  };


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <GenericInvitationExperience
      invitationPublicId={
        publicId
      }
      templateId={
        experience.template_id
      }
      variantId={
        experience.variant_id
      }
      data={
        data
      }
    />
  );
}