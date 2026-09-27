import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
export default async function LegacyPhotoWallEditor({ params }: { params: Promise<{ type: string; photoWallId: string; locale: string }> }) {
 const { type, photoWallId, locale } = await params;
 if (type !== "photo-wall") notFound();
 redirect({ href: `/dashboard/photo-wall/${photoWallId}/postavke`, locale });
}