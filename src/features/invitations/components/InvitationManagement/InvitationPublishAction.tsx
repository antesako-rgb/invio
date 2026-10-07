"use client";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";
import { useActionError } from "@/lib/actions/useActionError";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { setInvitationPublishedAction } from "../../actions/invitation/setInvitationPublishedAction";
export default function InvitationPublishAction({ id, published }: { id: string; published: boolean }) {
  const actionError = useActionError();
  const t = useTranslations("Invitations.management"); const router = useRouter(); const lock = useRef(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<ActionErrorCode | null>(null);
  async function apply() {
    if (lock.current) return; lock.current = true; setBusy(true); setError(null);
    try { const result = await setInvitationPublishedAction(id, !published); if (!result.success) { setError(result.code); return; } router.refresh(); }
    catch { setError("INVITATION_PUBLISH_FAILED"); } finally { lock.current = false; setBusy(false); }
  }
  return <div><Button variant={published ? "destructiveOutline" : "default"} disabled={busy} onClick={() => void apply()}>{t(published ? "unpublish" : "publish")}</Button>{error && <p role="alert">{actionError(error)}</p>}</div>;
}
