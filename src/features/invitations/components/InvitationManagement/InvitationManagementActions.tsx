"use client";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";
import { useActionError } from "@/lib/actions/useActionError";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import { manageInvitationAction } from "../../actions/invitation/manageInvitationAction";
import InvitationPublishAction from "./InvitationPublishAction";
import styles from "./InvitationManagement.module.css";

export default function InvitationManagementActions({ id, published, isOwner, afterDeleteHref }: { afterDeleteHref?: string; id: string; published: boolean; isOwner: boolean }) {
  const actionError = useActionError();
  const t = useTranslations("Invitations.management");
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<ActionErrorCode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function run(operation: "delete") {
    if (lock.current) return;
    lock.current = true; setBusy(true); setFailed(null);
    try {
      const result = await manageInvitationAction(id, operation);
      if (!result.success) { setFailed(result.code); return; }
      setConfirmDelete(false);
      if (operation === "delete" && afterDeleteHref) router.replace(afterDeleteHref);
      router.refresh();
    } catch { setFailed("INVITATION_UPDATE_FAILED"); }
    finally { lock.current = false; setBusy(false); }
  }
  return <>
    <div className={styles.actions}>
      <InvitationPublishAction id={id} published={published} />
      {isOwner && <Button variant="destructiveOutline" disabled={busy} onClick={() => { setFailed(null); setConfirmDelete(true); }}>{t("delete")}</Button>}
    </div>
    {failed && !confirmDelete && <p role="alert" className={styles.error}>{actionError(failed)}</p>}
    <Dialog open={confirmDelete} onOpenChange={open => { if (!lock.current) setConfirmDelete(open); }}>
      <DialogContent><DialogHeader><DialogTitle>{t("deleteTitle")}</DialogTitle><DialogDescription>{t("deleteHint")}</DialogDescription></DialogHeader>
        {failed && <p role="alert" className={styles.error}>{actionError(failed)}</p>}
        <div className={styles.actions}>
          <Button variant="outline" disabled={busy} onClick={() => setConfirmDelete(false)}>{t("cancel")}</Button>
          <Button variant="destructive" disabled={busy} onClick={() => void run("delete")}>{t("delete")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
