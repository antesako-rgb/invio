import { notFound } from "next/navigation";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import PhotoWallPhotosPage from "@/features/photo-walls/pages/PhotoWallPhotosPage/PhotoWallPhotosPage";
export default async function Page({ params }: { params: Promise<{ photoWallId: string }> }) {
 const wall = await getPhotoWall((await params).photoWallId);
 if (!wall) notFound();
 return <PhotoWallPhotosPage photoWallId={wall.id} />;
}
