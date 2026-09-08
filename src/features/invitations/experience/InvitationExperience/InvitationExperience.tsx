import type {
  ReactNode,
} from "react";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "@/features/invitations/styles/invitationTokens.css";
import "@/features/invitations/styles/invitationVariants.css";

import "./InvitationExperience.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationExperienceProps {
  children:
    ReactNode;

  templateId:
    string;

  variantId:
    string;

  mode:
    InvitationRenderMode;
}


/* ==========================================================================
   Invitation Experience
========================================================================== */

export default function InvitationExperience({
  children,
  templateId,
  variantId,
  mode,
}: InvitationExperienceProps) {
  return (
    <div
      className="invitation-experience"
      data-invitation-experience
      data-template={
        templateId
      }
      data-variant={
        variantId
      }
      data-mode={
        mode
      }
    >
      {children}
    </div>
  );
}