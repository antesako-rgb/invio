import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import PageHeader from "@/components/ui/page-header/PageHeader";
import ProjectSettings from "@/features/projects/components/ProjectSettings/ProjectSettings";
import { requireProjectOwner } from "@/features/projects/repositories/requireProjectOwner";

export default async function ProjectSettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await requireProjectOwner(projectId).catch(() => null);
  if (!project) notFound();
  const t = await getTranslations("Projects");
  return <Container><Page>
    <PageHeader title={t("settings.title")} backHref={`/dashboard/projects/${projectId}`} backLabel={t("back")} />
    <ProjectSettings projectId={projectId} initialName={project.name} isEvent={Boolean(project.project_event_details)} />
  </Page></Container>;
}
