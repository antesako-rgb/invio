"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";
import { cancelProjectCollaborationAction } from "../actions/cancelProjectCollaborationAction";
import { removeProjectCollaboratorAction } from "../actions/removeProjectCollaboratorAction";
import styles from "./Collaboration.module.css";

type Props = { email: string } & (
  { kind: "invite"; inviteId: string } |
  { kind: "member"; projectId: string; profileId: string }
);

export default function CollaborationMemberActions(props: Props) {
  const t = useTranslations("Projects.collaboration");
  const actionError = useActionError();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ActionErrorCode | null>(null);
  const label = props.kind === "invite" ? "cancelInvite" : "removeMember";

  async function confirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = props.kind === "invite"
        ? await cancelProjectCollaborationAction({ p_invite_id: props.inviteId })
        : await removeProjectCollaboratorAction({ p_project_id: props.projectId, p_profile_id: props.profileId });
      if (!result.success) { setError(result.code); return; }
      setOpen(false);
    } catch { setError("COLLABORATION_FAILED"); }
    finally { setPending(false); }
  }

  return <AlertDialog open={open} onOpenChange={(next, details) => {
    if (pending) { details.cancel(); return; }
    setOpen(next);
    setError(null);
  }}>
    <AlertDialogTrigger render={<Button size="sm" variant="destructiveOutline" />}>
      {t(label)}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{t(label)}</AlertDialogTitle>
        <AlertDialogDescription>{t(props.kind === "invite" ? "cancelConfirm" : "removeConfirm", { email: props.email })}</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p role="alert" className={styles.error}>{actionError(error)}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>{t("keep")}</AlertDialogCancel>
        <Button variant="destructive" loading={pending} disabled={pending} onClick={confirm}>{t(label)}</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
