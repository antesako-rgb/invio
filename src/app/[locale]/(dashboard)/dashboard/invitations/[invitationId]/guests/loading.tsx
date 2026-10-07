import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import styles from "@/features/invitation-guests/components/InvitationRecipients/InvitationRecipients.module.css";

export default async function RecipientLoading() {
  const t = await getTranslations("Invitations.recipients");
  return <div className={styles.section} aria-busy="true" aria-label={t("loading")}><Skeleton className={styles.skeleton} /><Skeleton className={styles.skeleton} /></div>;
}
