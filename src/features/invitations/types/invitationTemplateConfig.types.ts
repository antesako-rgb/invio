import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  InvitationEnvelopeId,
} from "@/features/invitations/experience/envelope/types/invitationEnvelope.types";


/* ==========================================================================
   Invitation Template Variant Config
========================================================================== */

export interface InvitationTemplateVariantConfig {
  id:
    string;

  label:
    string;

  previewUrl:
    string;

  swatch:
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
    string;

  variants:
    readonly InvitationTemplateVariantConfig[];
}