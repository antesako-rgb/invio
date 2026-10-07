import { redirect } from "@/i18n/navigation";
export default async function Page({ params }: { params: Promise<{ projectId: string; locale: string }> }) {
 const { projectId, locale } = await params;
 redirect({ href: `/dashboard/projects/${projectId}/invitations`, locale });
}
