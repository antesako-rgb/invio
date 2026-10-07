"use client";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

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
  templateId: string;
  disabled?: boolean;
}

/* ==========================================================================
   Create Invitation Button
========================================================================== */

export default function CreateInvitationButton({ projectId, templateId, disabled = false }: CreateInvitationButtonProps) {
  const actionError = useActionError();
  const t = useTranslations("Invitations");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ActionErrorCode | null>(null);
  const lock = useRef(false);

  async function create() {
    if (lock.current || disabled) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setError(null);

    try {
      const result = await createInvitationAction(projectId, templateId);

      if (!result.success) {
        setError(result.code);
        return;
      }

      router.push(`/editor/invitation/${result.data.invitationId}/uredi`);
      router.refresh();
    } catch {
      setError("INVITATION_CREATE_FAILED");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div>
      <Button disabled={busy || disabled} loading={busy} onClick={() => void create()}>
        {t("create")}
      </Button>
      {error && <p role="alert">{actionError(error)}</p>}
    </div>
  );
}
