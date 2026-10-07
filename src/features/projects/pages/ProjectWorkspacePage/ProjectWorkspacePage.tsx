import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import ProjectHeader from "../../components/ProjectHeader/ProjectHeader";
import { getProject } from "../../repositories/getProject";
import { createServerClient } from "@/lib/supabase/server";
export default async function ProjectWorkspacePage({ projectId, children }: { projectId: string; children: ReactNode }) {
  const supabase = await createServerClient();
  const [project, auth] = await Promise.all([getProject(projectId), supabase.auth.getUser()]);
  if (!project) notFound();
  return <Container><Page>
    <ProjectHeader project={project} isOwner={auth.data.user?.id === project.owner_id} />
    {children}
  </Page></Container>;
}
