import { notFound } from "next/navigation";
import { getDigitalAlbum } from "@/features/digital-albums/repositories/album/getDigitalAlbum";
import DigitalAlbumManagementPage from "@/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage";
export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
 const album = await getDigitalAlbum((await params).albumId);
 if (!album) notFound();
 return <DigitalAlbumManagementPage album={album} />;
}
