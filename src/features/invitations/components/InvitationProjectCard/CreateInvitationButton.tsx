"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createInvitationAction } from "../../actions/invitation/createInvitationAction";

/* ==========================================================================
   Types
========================================================================== */

interface CreateInvitationButtonProps {
  projectId: string;
}

/* ==========================================================================
   Create Invitation Button
========================================================================== */

export default function CreateInvitationButton({ projectId }: CreateInvitationButtonProps) {
  const t = useTranslations("Invitations");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);

  async function create() {
    if (lock.current) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setError(false);

    try {
      const result = await createInvitationAction(projectId);

      if (!result.success) {
        setError(true);
        return;
      }

      router.push(`/editor/invitation/${result.data.invitationId}/uredi`);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div>
      <Button disabled={busy} loading={busy} onClick={() => void create()}>
        {t("create")}
      </Button>
      {error && <p role="alert">{t("error")}</p>}
    </div>
  );
}
