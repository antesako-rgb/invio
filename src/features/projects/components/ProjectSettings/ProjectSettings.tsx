"use client";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import { deleteProjectAction } from "../../actions/deleteProjectAction";
import styles from "./ProjectSettings.module.css";

export default function ProjectSettings({ projectId, initialName }: { projectId: string; initialName: string }) {
  const actionError = useActionError();
  const t = useTranslations("Projects.settings");
  const projectText = useTranslations("Projects");
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<ActionErrorCode | null>(null);
  const lock = useRef(false);
  async function remove() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage(null);
    try {
      const result = await deleteProjectAction({ p_project_id: projectId });
      if (result.success) { router.replace("/dashboard/projects"); router.refresh(); }
      else { setMessage(result.code); setConfirm(false); }
    } catch { setMessage("ACTION_FAILED"); setConfirm(false); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className={styles.settings}>
    <ButtonLink href={`/dashboard/projects/${projectId}/event`} variant="secondary">{projectText("editEvent")}</ButtonLink>
    {message && <p role="alert">{actionError(message)}</p>}
    <section className={styles.danger}>
      <h2>{t("deleteEvent")}</h2><p>{t("deleteDescription")}</p>
      <Button variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>{t("deleteEvent")}</Button>
    </section>
    <Dialog open={confirm} onOpenChange={open => { if (!lock.current) setConfirm(open); }}>
      <DialogContent><DialogHeader><DialogTitle>{t("confirmTitle", { name: initialName })}</DialogTitle><DialogDescription>{t("deleteDescription")}</DialogDescription></DialogHeader>
        <div className={styles.actions}><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>{t("cancel")}</Button><Button variant="destructive" disabled={busy} loading={busy} onClick={() => void remove()}>{t("confirm")}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
