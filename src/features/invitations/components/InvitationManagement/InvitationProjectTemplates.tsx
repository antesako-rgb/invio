import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/repositories/getProject";
import { isProjectEventType } from "@/features/projects/types/projectEvent.types";
import { getInvitationTemplates } from "@/features/invitations/repositories/templates/getInvitationTemplates";
import InvitationTemplateCatalog from "@/features/invitations/components/InvitationManagement/InvitationTemplateCatalog";
export default async function InvitationProjectTemplates({ projectId }: { projectId: string }) {
  const supabase = await createServerClient();
  const [project, templates, auth] = await Promise.all([getProject(projectId), getInvitationTemplates(), supabase.auth.getUser()]);
  if (!project) notFound();
  const type = project.type;
  const projectType = type && isProjectEventType(type) ? type : null;
  return <InvitationTemplateCatalog key={`${projectId}:${projectType}`} projectId={projectId} projectType={projectType}
    isOwner={project.owner_id === auth.data.user?.id} templates={templates} />;
}
