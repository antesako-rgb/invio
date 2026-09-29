import { getTranslations } from "next-intl/server";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { getProjectInvitation } from "../../repositories/invitation/getProjectInvitation";
import CreateInvitationButton from "./CreateInvitationButton";
import styles from "./InvitationProjectCard.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface InvitationProjectCardProps {
  projectId: string;
  isEvent: boolean;
  isOwner: boolean;
}

/* ==========================================================================
   Invitation Project Card
========================================================================== */

export default async function InvitationProjectCard({
  projectId,
  isEvent,
  isOwner,
}: InvitationProjectCardProps) {
  const invitation = await getProjectInvitation(projectId);

  if (!isEvent && !invitation) {
    return null;
  }

  const t = await getTranslations("Invitations");

  return (
    <Card className={styles.card}>
      <CardTitle>{t("title")}</CardTitle>
      <p>{invitation ? invitation.name : t("description")}</p>
      {invitation ? (
        <div className={styles.actions}>
          <span>{t(invitation.is_public ? "published" : "draft")}</span>
          <ButtonLink
            variant="outline"
            href={`/editor/invitation/${invitation.id}/uredi`}
          >
            {t("open")}
          </ButtonLink>
        </div>
      ) : isOwner ? (
        <CreateInvitationButton projectId={projectId} />
      ) : (
        <p>{t("notCreated")}</p>
      )}
    </Card>
  );
}
