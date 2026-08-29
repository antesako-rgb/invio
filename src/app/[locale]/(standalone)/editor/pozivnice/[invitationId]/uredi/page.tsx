import {
  notFound,
} from "next/navigation";

import InvitationEditorView
  from "@/features/invitations/editor/components/InvitationEditorView/InvitationEditorView";

import {
  getInvitation,
} from "@/features/invitations/repositories/getInvitation";

import {
  buildInvitationRenderData,
} from "@/features/invitations/renderer/buildInvitationRenderData";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface EditInvitationPageProps {
  params:
    Promise<{
      locale:
        Locale;

      invitationId:
        string;
    }>;
}


/* ==========================================================================
   Edit Invitation Page
========================================================================== */

export default async function EditInvitationPage({
  params,
}: EditInvitationPageProps) {
  const {
    locale,
    invitationId,
  } =
    await params;

  const invitation =
    await getInvitation(
      invitationId
    );

  if (!invitation) {
    notFound();
  }

  const data =
    buildInvitationRenderData({
      invitation,
      locale,
    });

  return (
    <InvitationEditorView
      invitationId={
        invitation.id
      }
      invitationName={
        invitation.name
      }
      templateId={
        invitation.template_id
      }
      variantId={
        invitation.variant_id
      }
      locale={
        locale
      }
      data={
        data
      }
    />
  );
}