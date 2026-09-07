import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import {
  buildInvitationDateDisplay,
} from "@/features/invitations/renderer/buildInvitationDateDisplay";

import {
  buildInvitationLocationDisplay,
} from "@/features/invitations/renderer/buildInvitationLocationDisplay";

import {
  buildInvitationTimeDisplay,
} from "@/features/invitations/renderer/buildInvitationTimeDisplay";

import {
  invitationPreviewContentRegistry,
} from "@/features/invitations/preview/data/invitationPreviewContentRegistry";

import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import {
  INVITATION_EDITOR_PREVIEW_GUESTS,
} from "@/features/invitations/editor/data/InvitationEditorPreviewGuests";

import type {
  InvitationRenderData,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPreviewProps {
  templateId:
    string;

  variantId:
    string;

  locale:
    string;
}


/* ==========================================================================
   Invitation Preview
========================================================================== */

export default function InvitationPreview({
  templateId,
  variantId,
  locale,
}: InvitationPreviewProps) {
  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    invitationTemplateRegistry[
      templateId
    ];

  if (!template) {
    return null;
  }


  /* ==========================================================================
     Preview Content
  ========================================================================== */

  const previewContent =
    invitationPreviewContentRegistry[
      template.category
    ];

  if (!previewContent) {
    return null;
  }


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const data:
    InvitationRenderData = {
      content:
        previewContent,

      presentation:
        {},

      display: {
        date:
          buildInvitationDateDisplay(
            previewContent.date,
            locale
          ),

        time:
          buildInvitationTimeDisplay(
            previewContent.time
          ),

        location:
          buildInvitationLocationDisplay(
            previewContent.location
          ),
      },

      guests:
        INVITATION_EDITOR_PREVIEW_GUESTS,
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
      mode="preview"
      data={
        data
      }
    />
  );
}