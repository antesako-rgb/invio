import {
  notFound,
} from "next/navigation";

import type {
  EventType,
} from "@/features/events/types/event.types";

import InvitationEditorView
  from "@/features/invitations/editor/components/InvitationEditorView/InvitationEditorView";

import {
  getInvitationEditorData,
} from "@/features/invitations/repositories/invitation/getInvitationEditorData";

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

  const editorData =
    await getInvitationEditorData(
      invitationId
    );

  if (!editorData) {
    notFound();
  }

  const {
    invitation,
    event,
  } =
    editorData;

  const data =
    buildInvitationRenderData({
      invitation,
      locale,
      guests: [],
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
      eventType={
        event.type as EventType
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