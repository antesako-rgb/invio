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
   Invitation Template Type
========================================================================== */

export type InvitationTemplateType =
  | "invitation"
  | "save-the-date"
  | "thank-you";


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
   Invitation Template Card Config
========================================================================== */

export interface InvitationTemplateCardConfig {
  aspectRatio:
    `${number} / ${number}`;
}


/* ==========================================================================
   Invitation Template Features Config
========================================================================== */

export interface InvitationTemplateFeaturesConfig {
  details:
    boolean;

  rsvp:
    boolean;
}


/* ==========================================================================
   Invitation Template Config
========================================================================== */

export interface InvitationTemplateConfig {
  type:
    InvitationTemplateType;

  family:
    string;

  category:
    EventType;

  preview:
    InvitationTemplatePreviewConfig;

  card:
    InvitationTemplateCardConfig;

  features:
    InvitationTemplateFeaturesConfig;

  envelopeId:
    InvitationEnvelopeId;

  defaultVariantId:
    InvitationVariantId;

  variants:
    readonly InvitationTemplateVariantConfig[];
}