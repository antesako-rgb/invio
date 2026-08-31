import {
  notFound,
} from "next/navigation";

import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import {
  getPublicInvitation,
} from "@/features/invitations/repositories/getPublicInvitation";

import {
  buildInvitationRenderData,
} from "@/features/invitations/renderer/buildInvitationRenderData";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface PublicInvitationPageProps {
  params:
    Promise<{
      locale:
        Locale;

      publicId:
        string;
    }>;
}


/* ==========================================================================
   Public Invitation Page
========================================================================== */

export default async function PublicInvitationPage({
  params,
}: PublicInvitationPageProps) {
  const {
    locale,
    publicId,
  } =
    await params;

  const invitation =
    await getPublicInvitation({
      p_public_id:
        publicId,
    });

  if (!invitation) {
    notFound();
  }

  const data =
    buildInvitationRenderData({
      invitation,
      locale,
    });

  return (
    <InvitationRenderer
      templateId={
        invitation.template_id
      }
      variantId={
        invitation.variant_id
      }
      mode="live"
      data={
        data
      }
    />
  );
}