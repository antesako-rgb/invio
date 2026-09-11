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


/* ==========================================================================
   Types
========================================================================== */

interface PublicInvitationPageProps {
  params:
    Promise<{
      locale:
        Locale;

      publicId:
        string;
    }>;
}


/* ==========================================================================
   Public Invitation Page
========================================================================== */

export default async function PublicInvitationPage({
  params,
}: PublicInvitationPageProps) {
  const {
    locale,
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
    const recipient =
      await getPublicInvitationRecipient({
        publicId,
      });

    if (
      !recipient
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
     Generic Invitation
  ========================================================================== */

  if (
    !publicId.startsWith(
      "inv_"
    )
  ) {
    notFound();
  }

  const invitation =
    await getPublicEventExperience({
      publicId,
    });

  if (
    !invitation
  ) {
    notFound();
  }


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

const photoWallPhotos =
  invitation.type ===
    "photo-wall"
    ? await getPublicPhotoWallPhotos({
        p_public_id:
          publicId,

        p_limit:
          30,
      })
    : undefined;


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const baseData =
    buildEventExperienceRenderData({
      experience:
        invitation,

      locale,

      eventTimezone:
        invitation.event_timezone,

      publicId,
    });

  const data = {
    ...baseData,

    photoWall:
      photoWallPhotos
        ? {
            photos:
              photoWallPhotos,
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
        invitation.template_id
      }
      variantId={
        invitation.variant_id
      }
      data={
        data
      }
    />
  );
}