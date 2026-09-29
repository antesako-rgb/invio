import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
export default async function ProjectPage({ params }: { params: Promise<{ locale: string; projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectWorkspacePage projectId={projectId} />;
}
