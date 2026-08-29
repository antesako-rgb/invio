import {
  notFound,
} from "next/navigation";

import InvitationPreview
  from "@/features/invitations/preview/InvitationPreview";

import {
  getInvitationTemplateConfig,
  getInvitationVariantConfig,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry.utils";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPreviewPageProps {
  params:
    Promise<{
      locale:
        Locale;

      templateId:
        string;

      variantId:
        string;
    }>;
}


/* ==========================================================================
   Invitation Preview Page
========================================================================== */

export default async function InvitationPreviewPage({
  params,
}: InvitationPreviewPageProps) {
  const {
    locale,
    templateId,
    variantId,
  } =
    await params;

  const template =
    getInvitationTemplateConfig(
      templateId
    );

  if (!template) {
    notFound();
  }

  const variant =
    getInvitationVariantConfig(
      templateId,
      variantId
    );

  if (!variant) {
    notFound();
  }

  return (
    <InvitationPreview
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      locale={
        locale
      }
    />
  );
}