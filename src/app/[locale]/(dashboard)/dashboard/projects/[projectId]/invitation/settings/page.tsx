import { redirectLegacyInvitation } from "@/features/invitations/utils/redirectLegacyInvitation";
export default async function Page({ params, searchParams }: { params: Promise<{ projectId: string; locale: string }>; searchParams: Promise<{ invitation?: string }> }) {
 const { projectId, locale } = await params;
 await redirectLegacyInvitation(projectId, locale, (await searchParams).invitation, "settings");
}
