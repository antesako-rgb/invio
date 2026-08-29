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
  floraPreviewContent,
} from "@/features/invitations/preview/data/floraPreviewContent";

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
  const data:
    InvitationRenderData = {
      content:
        floraPreviewContent,

      presentation:
        {},

      display: {
        date:
          buildInvitationDateDisplay(
            floraPreviewContent.date,
            locale
          ),

        time:
          buildInvitationTimeDisplay(
            floraPreviewContent.time
          ),

        location:
          buildInvitationLocationDisplay(
            floraPreviewContent.location
          ),
      },
    };

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