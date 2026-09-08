import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  InvitationVariantId,
} from "@/features/invitations/config/invitationVariants";

import type {
  InvitationEnvelopeId,
} from "@/features/invitations/experience/envelope/types/invitationEnvelope.types";


/* ==========================================================================
   Invitation Template Variant Config
========================================================================== */

export interface InvitationTemplateVariantConfig {
  id:
    InvitationVariantId;

  previewUrl:
    string;
}


/* ==========================================================================
   Invitation Template Preview Config
========================================================================== */

export interface InvitationTemplatePreviewConfig {
  cardUrl:
    string;

  imageUrl:
    string | null;
}


/* ==========================================================================
   Invitation Template Config
========================================================================== */

export interface InvitationTemplateConfig {
  category:
    EventType;

  preview:
    InvitationTemplatePreviewConfig;

  envelopeId:
    InvitationEnvelopeId;

  defaultVariantId:
    InvitationVariantId;

  variants:
    readonly InvitationTemplateVariantConfig[];
}