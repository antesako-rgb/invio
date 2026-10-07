import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import InvitationProjectTemplates from "@/features/invitations/components/InvitationManagement/InvitationProjectTemplates";
export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
 const { projectId } = await params;
 return <ProjectWorkspacePage projectId={projectId}><InvitationProjectTemplates projectId={projectId} /></ProjectWorkspacePage>;
}
