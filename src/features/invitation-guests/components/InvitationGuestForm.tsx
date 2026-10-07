"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { guestFieldsSchema } from "../validation/invitationGuest.schema";
import type { InvitationGuest, InvitationGuestGroup, CreateInvitationGuestInput } from "../types/invitationGuest.types";
import styles from "./InvitationGuests.module.css";
import type { GuestSurfaceFooter } from "./GuestManagementSurface";

export default function InvitationGuestForm({ guest, groups, busy, onSave, onCancel, Footer }: {
  guest?: InvitationGuest; groups: InvitationGuestGroup[]; busy: boolean;
  onSave: (fields: Omit<CreateInvitationGuestInput, "p_invitation_id">) => void; onCancel: () => void;
  Footer: GuestSurfaceFooter;
}) {
  const t = useTranslations("InvitationGuests");
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = guestFieldsSchema.safeParse({ p_first_name: form.get("firstName"), p_last_name: form.get("lastName"), p_notes: form.get("notes"), p_group_id: form.get("groupId") || null });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], t(issue.path[0] === "p_first_name" && issue.code === "too_small" ? "validation.firstName" : "validation.invalid")] )));
      return;
    }
    setErrors({}); onSave(parsed.data);
  }
  return <form onSubmit={submit} noValidate className={styles.guestForm}>
    <fieldset disabled={busy} className={styles.fields}>
      <div className={styles.twoFields}>
        <Field id={`${id}-first`} label={t("form.firstName")} required error={errors.p_first_name}>
          <Input name="firstName" autoComplete="given-name" required maxLength={100} defaultValue={guest?.first_name ?? ""} />
        </Field>
        <Field id={`${id}-last`} label={t("form.lastName")} error={errors.p_last_name}>
          <Input name="lastName" autoComplete="family-name" maxLength={100} defaultValue={guest?.last_name ?? ""} />
        </Field>
      </div>
      <Field id={`${id}-group`} label={t("form.group")} error={errors.p_group_id}>
        <Select name="groupId" defaultValue={guest?.group_id ?? ""} options={[{ value: "", label: t("noGroup") }, ...groups.map(group => ({ value: group.id, label: group.name }))]} />
      </Field>
      <Field id={`${id}-notes`} label={t("form.notes")} description={t("form.notesHelp")} error={errors.p_notes}>
        <Textarea name="notes" maxLength={2000} rows={3} defaultValue={guest?.notes ?? ""} />
      </Field>
    </fieldset>
      <Footer className={styles.stickyFooter}>
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>{t("cancel")}</Button>
        <Button type="submit" loading={busy}>{t(guest ? "save" : "addGuest")}</Button>
      </Footer>
  </form>;
}
