import { getGenericInvitationResponses } from "@/features/invitation-guests/repositories/rsvp/getGenericInvitationResponses";
import { notFound } from "next/navigation";
import { getInvitation } from "@/features/invitations/repositories/invitation/getInvitation";
import { getInvitationRecipientManagement } from "@/features/invitation-guests/repositories/recipients/getInvitationRecipients";
import InvitationGuestWorkspace from "@/features/invitation-guests/components/InvitationGuestWorkspace";
import { getInvitationGuestGroups } from "@/features/invitation-guests/repositories/guests/getInvitationGuestGroups";
import { parseInvitationDocument } from "@/features/invitations/utils/parseInvitationDocument";
export default async function Page({ params }: { params: Promise<{ invitationId: string }> }) {
  const invitation = await getInvitation((await params).invitationId);
  if (!invitation) notFound();
  const [{ recipients, guests }, genericResponses, groups] = await Promise.all([getInvitationRecipientManagement(invitation.id), getGenericInvitationResponses(invitation.id), getInvitationGuestGroups(invitation.id)]);
  const questions = parseInvitationDocument(invitation.document).pages.find(page => page.type === "rsvp")?.rsvp?.questions ?? [];
  return <InvitationGuestWorkspace invitationId={invitation.id} groups={groups} recipients={recipients} guests={guests} questions={questions} genericResponses={genericResponses} />;
}
