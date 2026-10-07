"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import { Button } from "@/components/ui/button";
import styles from "@/features/invitations/components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.module.css";

export default function PersonalizedRsvpError({ reset }: { reset: () => void }) {
  const t = useTranslations("Invitations.publicRsvp");
  return <main className={styles.page}><EmptyState title={t("loadErrorTitle")} description={t("loadErrorDescription")} action={<Button variant="secondary" onClick={reset}>{t("retry")}</Button>} /></main>;
}
