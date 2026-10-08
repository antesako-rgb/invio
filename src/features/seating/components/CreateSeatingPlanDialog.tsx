"use client";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import { manageSeatingPlanAction } from "../actions/seatingActions";
import { createPlanFromTemplateAction } from "../actions/createPlanFromTemplateAction";
import styles from "./SeatingWorkspace.module.css";
export default function CreateSeatingPlanDialog({ projectId, templates, open, onClose }: {
  projectId: string; templates: { id: string; name: string }[]; open: boolean; onClose: () => void;
}) {
  const t = useTranslations("Seating"); const router = useRouter();
  const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current || uncertain) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const templateId = String(form.get("template") ?? "");
    lock.current = true; setBusy(true); setError("");
    let navigating = false;
    try {
      const result = templateId
        ? await createPlanFromTemplateAction({ projectId, templateId, name, rsvpInvitationId: null })
        : await manageSeatingPlanAction({ p_project_id: projectId, p_plan_id: null, p_revision: null, p_operation: "create",
          p_name: name, p_width_cm: 2000, p_height_cm: 1500, p_rsvp_invitation_id: null });
      if (!result.success) { setError("saveFailed"); return; }
      const parsed = z.object({ id: z.string().uuid() }).safeParse(result.data);
      if (!parsed.success) { setUncertain(true); setError("reloadRequired"); return; }
      navigating = true;
      router.push("/dashboard/projects/" + projectId + "/seating/" + parsed.data.id);
    } catch { navigating = false; setUncertain(true); setError("reloadRequired"); }
    finally { if (!navigating) { lock.current = false; setBusy(false); } }
  }
  return <Dialog open={open} onOpenChange={value => { if (!value && !lock.current) onClose(); }}>
    <DialogContent className={styles.dialog}><DialogHeader><DialogTitle>{t("createPlan")}</DialogTitle><DialogDescription>{t("createPlanHelp")}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className={styles.workspace}><fieldset disabled={busy || uncertain} className={styles.formFields}>
        <Field label={t("name")}><Input name="name" required maxLength={150} autoFocus /></Field>
        <Field label={t("template")}><Select name="template" defaultValue="" options={[{ value: "", label: t("blank") }, ...templates.map(template => ({ value: template.id, label: template.name }))]} /></Field>
      </fieldset>
      {error && <div role="alert" className={styles.warning}>{t(error)}{uncertain && <Button type="button" variant="outline" onClick={() => { onClose(); router.refresh(); }}>{t("reload")}</Button>}</div>}
      <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t("cancel")}</Button><Button type="submit" loading={busy} disabled={uncertain}>{t("create")}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
