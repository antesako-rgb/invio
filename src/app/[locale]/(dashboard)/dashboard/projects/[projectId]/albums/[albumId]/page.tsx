import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getDigitalAlbum } from "@/features/digital-albums/repositories/album/getDigitalAlbum";
export default async function Page({ params }: { params: Promise<{ projectId: string; albumId: string; locale: string }> }) {
 const { projectId, albumId, locale } = await params;
 const album = await getDigitalAlbum(albumId);
 if (!album || album.project_id !== projectId) notFound();
 redirect({ href: `/dashboard/albums/${album.id}`, locale });
}
