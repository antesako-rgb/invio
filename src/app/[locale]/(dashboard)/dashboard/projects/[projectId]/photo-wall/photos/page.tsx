import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getProjectPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";
export default async function Page({ params }: { params: Promise<{ projectId: string; locale: string }> }) {
 const { projectId, locale } = await params;
 const wall = await getProjectPhotoWall(projectId);
 if (!wall) notFound();
 redirect({ href: `/dashboard/photo-walls/${wall.id}/photos`, locale });
}
