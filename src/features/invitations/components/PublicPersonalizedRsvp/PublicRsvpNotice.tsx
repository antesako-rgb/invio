"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import { Button } from "@/components/ui/button";

export default function PublicRsvpNotice({ unavailable }: { unavailable: boolean }) {
  const t = useTranslations("Invitations.publicRsvp");
  const router = useRouter();
  return <EmptyState title={t(unavailable ? "unavailableTitle" : "loadErrorTitle")} description={t(unavailable ? "unavailableDescription" : "loadErrorDescription")}
    action={!unavailable ? <Button variant="secondary" onClick={() => router.refresh()}>{t("retry")}</Button> : undefined} />;
}
