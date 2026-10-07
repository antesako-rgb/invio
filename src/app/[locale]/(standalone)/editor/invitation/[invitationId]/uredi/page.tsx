import {
  notFound,
} from "next/navigation";

import InvitationEditorView
  from "@/features/invitations/editor/components/InvitationEditorView/InvitationEditorView";

import {
  getInvitation,
} from "@/features/invitations/repositories/invitation/getInvitation";

import {
  getInvitationPhotos,
} from "@/features/invitations/repositories/photos/getInvitationPhotos";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorPageProps {
  params:
    Promise<{
      invitationId: string;
    }>;
}


/* ==========================================================================
   Invitation Editor Page
========================================================================== */

export default async function InvitationEditorPage({
  params,
}: InvitationEditorPageProps) {
  const {
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

  const photos = await getInvitationPhotos(invitation.id);

  return (
    <InvitationEditorView
      key={
        invitation.id
      }
      invitation={
        invitation
      }
      photos={
        photos
      }
    />
  );
}