import { notFound } from "next/navigation";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import PhotoWallSettingsPage from "@/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage";
export default async function Page({ params }: { params: Promise<{ photoWallId: string }> }) {
 const wall = await getPhotoWall((await params).photoWallId);
 if (!wall) notFound();
 return <PhotoWallSettingsPage photoWallId={wall.id} />;
}
