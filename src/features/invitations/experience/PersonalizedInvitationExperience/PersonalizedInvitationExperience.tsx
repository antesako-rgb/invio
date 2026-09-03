"use client";

import {
  submitInvitationRsvpAction,
} from "@/features/invitations/actions/invitation-rsvp/submitInvitationRsvpAction";

import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import type {
  InvitationRenderData,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface PersonalizedInvitationExperienceProps {
  recipientPublicId:
    string;

  eventTimezone:
    string;

  templateId:
    string;

  variantId:
    string;

  data:
    InvitationRenderData;
}


/* ==========================================================================
   Personalized Invitation Experience
========================================================================== */

export default function PersonalizedInvitationExperience({
  recipientPublicId,
  eventTimezone,
  templateId,
  variantId,
  data,
}: PersonalizedInvitationExperienceProps) {
  /* ==========================================================================
     RSVP Submit
  ========================================================================== */

  const handleRsvpSubmit:
    InvitationRsvpSubmitHandler =
    async (
      submissions
    ) => {
      const result =
        await submitInvitationRsvpAction({
          p_recipient_public_id:
            recipientPublicId,

          p_responses:
            submissions,
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
      eventTimezone={
        eventTimezone
      }
      onRsvpSubmit={
        handleRsvpSubmit
      }
    />
  );
}