"use client";

import {
  submitGenericInvitationRsvpAction,
} from "@/features/invitations/actions/invitation-rsvp/submitGenericInvitationRsvpAction";

import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import type {
  EventExperienceRenderData,
  GenericInvitationRsvpSubmitHandler,
} from "@/features/invitations/types/eventExperienceRenderer.types";


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
    EventExperienceRenderData;
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
          invitationPublicId,
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
     Render Data
  ========================================================================== */

const renderData:
  EventExperienceRenderData = {
    ...data,

    invitation: {
      guests: [],

      onSubmitGenericRsvp:
        handleRsvpSubmit,
    },
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