import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import styles from "@/features/invitations/components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.module.css";

export default async function PersonalizedRsvpLoading() {
  const t = await getTranslations("Invitations.publicRsvp");
  return <main className={styles.page} aria-busy="true" aria-label={t("loading")}><Skeleton className={styles.skeleton} /></main>;
}
