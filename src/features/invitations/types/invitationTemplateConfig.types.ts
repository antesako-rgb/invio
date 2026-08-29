import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  InvitationEnvelopeId,
} from "@/features/invitations/experience/envelope/types/invitationEnvelope.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";


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
   Invitation Template Config
========================================================================== */

export interface InvitationTemplateConfig {
  category:
    EventType;

  previewUrl:
    string;

  previewContent:
    InvitationContent;

  envelopeId:
    InvitationEnvelopeId;

  defaultVariantId:
    string;

  variants:
    readonly InvitationTemplateVariantConfig[];
}