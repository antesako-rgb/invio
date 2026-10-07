import DigitalAlbumCollection from "@/features/digital-albums/components/album-management/DigitalAlbumCollection/DigitalAlbumCollection";
import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CreateAlbumDialog from "@/features/projects/components/CreateAlbumDialog/CreateAlbumDialog";
import ManagementHeader from "@/features/management/components/ManagementHeader/ManagementHeader";
import { getProject } from "@/features/projects/repositories/getProject";
import { getProjectDigitalAlbums } from "@/features/digital-albums/repositories/album/getProjectDigitalAlbums";
import { createServerClient } from "@/lib/supabase/server";
export default async function ProjectAlbumsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  const [project, albums, auth, t] = await Promise.all([getProject(projectId), getProjectDigitalAlbums(projectId), supabase.auth.getUser(), getTranslations("Projects.products")]);
  if (!project) notFound();
  return <ProjectWorkspacePage projectId={projectId}>
    <ManagementHeader heading={<h1>{t("albums")}</h1>} actions={project.owner_id === auth.data.user?.id && <CreateAlbumDialog projectId={projectId}>{t("newAlbum")}</CreateAlbumDialog>} />
    <DigitalAlbumCollection albums={albums} />
  </ProjectWorkspacePage>;
}
