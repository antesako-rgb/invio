import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import type {
  InvitationTemplateConfig,
  InvitationTemplateVariantConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Get Invitation Template Config
========================================================================== */

export function getInvitationTemplateConfig(
  templateId: string
): InvitationTemplateConfig | null {
  return (
    invitationTemplateRegistry[
      templateId
    ] ??
    null
  );
}


/* ==========================================================================
   Get Invitation Variant Config
========================================================================== */

export function getInvitationVariantConfig(
  templateId: string,
  variantId: string
): InvitationTemplateVariantConfig | null {
  const template =
    getInvitationTemplateConfig(
      templateId
    );

  if (!template) {
    return null;
  }

  return (
    template.variants.find(
      (variant) =>
        variant.id ===
        variantId
    ) ??
    null
  );
}


/* ==========================================================================
   Get Default Invitation Variant Config
========================================================================== */

export function getDefaultInvitationVariantConfig(
  templateId: string
): InvitationTemplateVariantConfig | null {
  const template =
    getInvitationTemplateConfig(
      templateId
    );

  if (!template) {
    return null;
  }

  return (
    template.variants.find(
      (variant) =>
        variant.id ===
        template.defaultVariantId
    ) ??
    null
  );
}