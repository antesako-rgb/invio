import { redirect } from "@/i18n/navigation";
export default async function PhotoWallEntryRedirect({ params }: { params: Promise<{ locale: string; eventId: string }> }) {
 const { locale, eventId } = await params;
 redirect({ href: `/dashboard/dogadaji/${eventId}/photo-wall`, locale });
}