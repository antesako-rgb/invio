import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  EventExperienceVariantId,
} from "@/features/invitations/config/eventExperienceVariants";

import type {
  InvitationEnvelopeId,
} from "@/features/invitations/components/invitation-experience/envelope/InvitationEnvelope/types/invitationEnvelope.types";


/* ==========================================================================
   Event Experience Template Variant Config
========================================================================== */

export interface EventExperienceTemplateVariantConfig {
  id:
    EventExperienceVariantId;

  previewUrl:
    string;
}


/* ==========================================================================
   Event Experience Template Preview Config
========================================================================== */

export interface EventExperienceTemplatePreviewConfig {
  cardUrl:
    string;

  imageUrl:
    string | null;
}


/* ==========================================================================
   Event Experience Template Card Config
========================================================================== */

export interface EventExperienceTemplateCardConfig {
  aspectRatio:
    `${number} / ${number}`;
}


/* ==========================================================================
   Event Experience Template Features Config
========================================================================== */

export interface EventExperienceTemplateFeaturesConfig {
  details:
    boolean;

  rsvp:
    boolean;

  photos:
    boolean;
}


/* ==========================================================================
   Event Experience Template Config
========================================================================== */

export interface EventExperienceTemplateConfig {
  family:
    string;

  category:
    EventType;

  preview:
    EventExperienceTemplatePreviewConfig;

  card:
    EventExperienceTemplateCardConfig;

  features:
    EventExperienceTemplateFeaturesConfig;

  envelopeId:
    InvitationEnvelopeId | null;

  defaultVariantId:
    EventExperienceVariantId;

  variants:
    readonly EventExperienceTemplateVariantConfig[];
}