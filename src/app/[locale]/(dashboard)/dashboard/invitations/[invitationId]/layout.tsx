import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import ProjectProductContext from "@/features/projects/components/ProjectProductContext/ProjectProductContext";
import InvitationManagementNavigation from "@/features/invitations/components/InvitationManagement/InvitationManagementNavigation";
import { getInvitation } from "@/features/invitations/repositories/invitation/getInvitation";
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ invitationId: string }> }) {
 const invitation = await getInvitation((await params).invitationId);
 if (!invitation) notFound();
 return <Container><Page><ProjectProductContext projectId={invitation.project_id} product="invitations" />
   <InvitationManagementNavigation invitation={{ id: invitation.id, name: invitation.name, is_public: invitation.is_public }} />{children}
 </Page></Container>;
}
