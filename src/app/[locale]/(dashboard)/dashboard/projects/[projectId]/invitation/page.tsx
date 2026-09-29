import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getProject } from "@/features/projects/repositories/getProject";
import { getProjectInvitation } from "@/features/invitations/repositories/invitation/getProjectInvitation";
export default async function ProjectInvitationPage({ params }: { params: Promise<{ projectId: string; locale: string }> }) {
  const { projectId, locale } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();
  const invitation = await getProjectInvitation(projectId);
  if (!invitation) return redirect({ href: `/dashboard/projects/${projectId}`, locale });
  redirect({ href: `/editor/invitation/${invitation.id}/uredi`, locale });
}
