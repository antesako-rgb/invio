import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { getInvitation } from "@/features/invitations/repositories/invitation/getInvitation";
import { getProject } from "@/features/projects/repositories/getProject";
import { createServerClient } from "@/lib/supabase/server";
import InvitationManagementActions from "@/features/invitations/components/InvitationManagement/InvitationManagementActions";
import styles from "@/features/invitations/components/InvitationManagement/InvitationManagement.module.css";
export default async function Page({ params }: { params: Promise<{ invitationId: string }> }) {
 const invitation = await getInvitation((await params).invitationId);
 if (!invitation) notFound();
 const supabase = await createServerClient();
 const [project, auth, t] = await Promise.all([getProject(invitation.project_id), supabase.auth.getUser(), getTranslations("Invitations.management")]);
 if (!project) notFound();
 return <Card className={styles.card}><h2>{t("invitationStatus")}</h2>
   <p>{t(invitation.is_public ? "publishedHint" : "draftHint")}</p>
   <InvitationManagementActions id={invitation.id} published={invitation.is_public}
     isOwner={project.owner_id === auth.data.user?.id} afterDeleteHref={`/dashboard/projects/${project.id}/invitations`} />
 </Card>;
}
