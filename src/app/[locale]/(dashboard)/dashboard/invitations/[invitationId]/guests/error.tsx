"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";

export default function RecipientError({ reset }: { reset: () => void }) {
  const t = useTranslations("Invitations.recipients");
  return <EmptyState title={t("loadError")} description={t("failed")} action={<Button variant="secondary" onClick={reset}>{t("retry")}</Button>} />;
}
