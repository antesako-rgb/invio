"use client";

import {
  submitInvitationRsvpAction,
} from "@/features/invitations/actions/invitation-rsvp/submitInvitationRsvpAction";

import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import type {
  EventExperienceRenderData,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface PersonalizedInvitationExperienceProps {
  recipientPublicId:
    string;

  templateId:
    string;

  variantId:
    string;

  data:
    EventExperienceRenderData;
}


/* ==========================================================================
   Personalized Invitation Experience
========================================================================== */

export default function PersonalizedInvitationExperience({
  recipientPublicId,
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
          recipientPublicId,
          responses:
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
     Render Data
  ========================================================================== */

  const renderData:
    EventExperienceRenderData = {
      ...data,

      invitation:
        data.invitation
          ? {
              ...data.invitation,

              onSubmitRsvp:
                handleRsvpSubmit,
            }
          : undefined,
    };


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventExperienceRenderer
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      mode="live"
      data={
        renderData
      }
    />
  );
}