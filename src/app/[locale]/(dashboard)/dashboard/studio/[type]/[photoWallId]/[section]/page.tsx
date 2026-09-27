import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
export default async function LegacyPhotoWallRoute({ params }: {
  params: Promise<{ locale: string; type: string; photoWallId: string; section?: string }>;
}) {
  const { locale, type, photoWallId, section } = await params;
  if (type !== "photo-wall" || (section && !["fotografije", "materiali", "postavke"].includes(section))) notFound();
  redirect({ href: `/dashboard/photo-wall/${photoWallId}${section ? "/" + section : ""}`, locale });
}
