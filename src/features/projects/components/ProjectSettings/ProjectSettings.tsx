"use client";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import { updateProjectAction } from "../../actions/updateProjectAction";
import { deleteProjectAction } from "../../actions/deleteProjectAction";
import styles from "./ProjectSettings.module.css";

export default function ProjectSettings({ projectId, initialName, isEvent }: { projectId: string; initialName: string; isEvent: boolean }) {
  const t = useTranslations("Projects.settings");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<"error" | "saved" | null>(null);
  const lock = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !name.trim()) return;
    lock.current = true; setBusy(true); setMessage(null);
    try {
      const result = await updateProjectAction({ p_project_id: projectId, p_name: name.trim() });
      setMessage(result.success ? "saved" : "error");
      if (result.success) router.refresh();
    } catch { setMessage("error"); }
    finally { lock.current = false; setBusy(false); }
  }
  async function remove() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage(null);
    try {
      const result = await deleteProjectAction({ p_project_id: projectId });
      if (result.success) { router.replace("/dashboard/projects"); router.refresh(); }
      else { setMessage("error"); setConfirm(false); }
    } catch { setMessage("error"); setConfirm(false); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className={styles.settings}>
    <form className={styles.form} onSubmit={save}>
      <Field id="project-name" label={t("name")}><Input id="project-name" value={name} onChange={event => setName(event.target.value)} required maxLength={150} disabled={busy} /></Field>
      <Button type="submit" disabled={busy || !name.trim()} loading={busy}>{t("save")}</Button>
    </form>
    {message && <p role={message === "error" ? "alert" : "status"}>{t(message)}</p>}
    <section className={styles.danger}>
      <h2>{t(isEvent ? "deleteEvent" : "deleteContent")}</h2><p>{t("deleteDescription")}</p>
      <Button variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>{t(isEvent ? "deleteEvent" : "deleteContent")}</Button>
    </section>
    <Dialog open={confirm} onOpenChange={open => { if (!lock.current) setConfirm(open); }}>
      <DialogContent><DialogHeader><DialogTitle>{t("confirmTitle", { name: initialName })}</DialogTitle><DialogDescription>{t("deleteDescription")}</DialogDescription></DialogHeader>
        <div className={styles.actions}><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>{t("cancel")}</Button><Button variant="destructive" disabled={busy} loading={busy} onClick={() => void remove()}>{t("confirm")}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
