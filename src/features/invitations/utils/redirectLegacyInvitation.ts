import { redirect } from "@/i18n/navigation";
import { getInvitation } from "../repositories/invitation/getInvitation";
export async function redirectLegacyInvitation(projectId: string, locale: string, id: string | undefined, section: string) {
 const invitation = id ? await getInvitation(id) : null;
 const href = invitation?.project_id === projectId
   ? `/dashboard/invitations/${invitation.id}${section ? `/${section}` : ""}`
   : `/dashboard/projects/${projectId}/invitations${section === "templates" ? "/templates" : ""}`;
 redirect({ href, locale });
}
