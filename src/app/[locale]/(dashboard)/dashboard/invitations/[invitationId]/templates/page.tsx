import { notFound } from "next/navigation";
import { getInvitation } from "@/features/invitations/repositories/invitation/getInvitation";
import InvitationProjectTemplates from "@/features/invitations/components/InvitationManagement/InvitationProjectTemplates";
export default async function Page({ params }: { params: Promise<{ invitationId: string }> }) {
 const invitation = await getInvitation((await params).invitationId);
 if (!invitation) notFound();
 return <InvitationProjectTemplates projectId={invitation.project_id} />;
}
