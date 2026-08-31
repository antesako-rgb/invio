import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  InvitationRenderData,
} from "@/features/invitations/types/invitationRenderer.types";

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
  parseInvitationContent,
} from "@/features/invitations/renderer/parsers/parseInvitationContent";

import {
  parseInvitationPresentation,
} from "@/features/invitations/renderer/parsers/parseInvitationPresentation";


/* ==========================================================================
   Types
========================================================================== */

interface BuildInvitationRenderDataInput {
  invitation: {
    content:
      Json;

    presentation:
      Json;
  };

  locale:
    string;
}


/* ==========================================================================
   Build Invitation Render Data
========================================================================== */

export function buildInvitationRenderData({
  invitation,
  locale,
}: BuildInvitationRenderDataInput): InvitationRenderData {
  const content =
    parseInvitationContent(
      invitation.content
    );

  const presentation =
    parseInvitationPresentation(
      invitation.presentation
    );

  return {
    content,

    presentation,

    display: {
      date:
        buildInvitationDateDisplay(
          content.date,
          locale
        ),

      time:
        buildInvitationTimeDisplay(
          content.time
        ),

      location:
        buildInvitationLocationDisplay(
          content.location
        ),
    },
  };
}