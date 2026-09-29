import { notFound } from "next/navigation";
import { getDigitalAlbum } from "@/features/digital-albums/repositories/album/getDigitalAlbum";
import DigitalAlbumManagementPage from "@/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage";

export default async function ProjectAlbumPage({ params }: { params: Promise<{ projectId: string; albumId: string }> }) {
  const { projectId, albumId } = await params;
  const album = await getDigitalAlbum(albumId);
  if (!album || album.project_id !== projectId) notFound();
  return <DigitalAlbumManagementPage album={album} />;
}
