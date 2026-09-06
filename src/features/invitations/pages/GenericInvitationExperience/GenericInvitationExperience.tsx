"use client";

import {
  submitGenericInvitationRsvpAction,
} from "@/features/invitations/actions/invitation-rsvp/submitGenericInvitationRsvpAction";

import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import type {
  GenericInvitationRsvpSubmitHandler,
  InvitationRenderData,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface GenericInvitationExperienceProps {
  invitationPublicId:
    string;

  templateId:
    string;

  variantId:
    string;

  data:
    InvitationRenderData;
}


/* ==========================================================================
   Generic Invitation Experience
========================================================================== */

export default function GenericInvitationExperience({
  invitationPublicId,
  templateId,
  variantId,
  data,
}: GenericInvitationExperienceProps) {
  /* ==========================================================================
     RSVP Submit
  ========================================================================== */

  const handleRsvpSubmit:
    GenericInvitationRsvpSubmitHandler =
    async (
      guests
    ) => {
      const result =
        await submitGenericInvitationRsvpAction({
          p_invitation_public_id:
            invitationPublicId,

          p_guests:
            guests,
        });

      if (
        !result.success
      ) {
        throw new Error(
          result.message
        );
      }
    };


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <InvitationRenderer
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      mode="live"
      data={
        data
      }
      onGenericRsvpSubmit={
        handleRsvpSubmit
      }
    />
  );
}