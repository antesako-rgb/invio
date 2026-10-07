import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { createServerClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/repositories/getProject";
import { getProjectInvitations } from "@/features/invitations/repositories/invitation/getProjectInvitations";
import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import styles from "@/features/invitations/components/InvitationManagement/InvitationManagement.module.css";

export default async function ProjectInvitationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  const [project, invitations, auth, t] = await Promise.all([getProject(projectId), getProjectInvitations(projectId), supabase.auth.getUser(), getTranslations("Invitations.management")]);
  if (!project) notFound();
  const isOwner = project.owner_id === auth.data.user?.id;
  return <ProjectWorkspacePage projectId={projectId}><div className={styles.list}>
    <Card className={styles.card}>
      <h2>{t("status")}</h2>
      <p className={styles.hint}>{t("count", { count: invitations.length })}</p>
      <div className={styles.actions}>{isOwner && <ButtonLink href={`/dashboard/projects/${projectId}/invitations/templates`}>{t("create")}</ButtonLink>}</div>
    </Card>
    {invitations.length === 0 && <Card className={styles.card}><h2>{t("emptyTitle")}</h2><p className={styles.hint}>{t("emptyHint")}</p></Card>}
    {invitations.map(invitation => <Card key={invitation.id} className={styles.card}>
      <div className={styles.row}><h2>{invitation.name}</h2><span className={styles.badge}>{t(invitation.is_public ? "published" : "draft")}</span></div>
      <div className={styles.actions}>
        {invitation.is_public && <ButtonLink variant="outline" href={`/invitation/${invitation.public_id}`}>{t("publicLink")}</ButtonLink>}
        <ButtonLink variant="secondary" href={`/dashboard/invitations/${invitation.id}`}>{t("manage")}</ButtonLink>
      </div>
    </Card>)}
  </div></ProjectWorkspacePage>;
}
