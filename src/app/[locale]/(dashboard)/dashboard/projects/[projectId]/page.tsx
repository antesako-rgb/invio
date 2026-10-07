import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import ProjectProductCards from "@/features/projects/components/ProjectProductCards/ProjectProductCards";
import { getDashboardProducts } from "@/features/dashboard/repositories/getDashboardProducts";
import { getProject } from "@/features/projects/repositories/getProject";
import { createServerClient } from "@/lib/supabase/server";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  const [products, project, auth] = await Promise.all([
    getDashboardProducts([projectId]),
    getProject(projectId),
    supabase.auth.getUser(),
  ]);
  return <ProjectWorkspacePage projectId={projectId}>
    <ProjectProductCards projectId={projectId} products={products} canCreateAlbum={!!project && project.owner_id === auth.data.user?.id} />
  </ProjectWorkspacePage>;
}
