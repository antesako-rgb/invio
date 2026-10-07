import { notFound } from "next/navigation";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import PhotoWallOverviewPage from "@/features/photo-walls/pages/PhotoWallOverviewPage/PhotoWallOverviewPage";
export default async function Page({ params }: { params: Promise<{ photoWallId: string }> }) {
 const wall = await getPhotoWall((await params).photoWallId);
 if (!wall) notFound();
 return <PhotoWallOverviewPage photoWallId={wall.id} />;
}
