import { notFound } from "next/navigation";
import { requireProjectOwner } from "@/features/projects/repositories/requireProjectOwner";
import CreateAlbumPage from "@/features/projects/pages/CreateAlbumPage/CreateAlbumPage";
export default async function NewProjectAlbumPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  try { await requireProjectOwner(projectId); } catch { notFound(); }
  return <CreateAlbumPage projectId={projectId} />;
}
