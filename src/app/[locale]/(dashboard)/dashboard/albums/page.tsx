import { redirect } from "@/i18n/navigation";

// Keep old bookmarks working; My events is the single discovery surface.
export default async function AlbumsPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: "/dashboard/projects", locale: (await params).locale });
}
