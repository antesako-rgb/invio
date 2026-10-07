import { notFound } from "next/navigation";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import PhotoWallMaterialsPage from "@/features/photo-walls/pages/PhotoWallMaterialsPage/PhotoWallMaterialsPage";
export default async function Page({ params }: { params: Promise<{ photoWallId: string }> }) {
 const wall = await getPhotoWall((await params).photoWallId);
 if (!wall) notFound();
 return <PhotoWallMaterialsPage photoWallId={wall.id} />;
}
