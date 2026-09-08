import {
  notFound,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  buildInvitationRenderData,
} from "@/features/invitations/renderer/buildInvitationRenderData";

import {
  buildInvitationRenderGuests,
} from "@/features/invitations/renderer/buildInvitationRenderGuests";

import {
  getPublicInvitation,
} from "@/features/invitations/repositories/invitation/getPublicInvitation";

import {
  getPublicInvitationRecipient,
} from "@/features/invitations/repositories/invitation-recipients/getPublicInvitationRecipient";

import GenericInvitationExperience
  from "@/features/invitations/pages/GenericInvitationExperience/GenericInvitationExperience";

import PersonalizedInvitationExperience
  from "@/features/invitations/pages/PersonalizedInvitationExperience/PersonalizedInvitationExperience";


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
        p_public_id:
          publicId,
      });

    if (!recipient) {
      notFound();
    }

    const guests =
      buildInvitationRenderGuests(
        recipient.guests
      );

    const data =
      buildInvitationRenderData({
        invitation:
          recipient.invitation,

        locale,

        eventTimezone:
          recipient.event.timezone,

        guests,
      });

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
    await getPublicInvitation({
      p_public_id:
        publicId,
    });

  if (!invitation) {
    notFound();
  }
const data =
  buildInvitationRenderData({
    invitation,

    locale,

    eventTimezone:
      invitation.event_timezone,

    guests: [],
  });

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