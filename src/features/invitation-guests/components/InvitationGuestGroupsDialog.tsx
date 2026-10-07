"use client";

import { useId, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import GuestManagementSurface from "./GuestManagementSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import type { InvitationGuestGroup } from "../types/invitationGuest.types";
import styles from "./InvitationGuests.module.css";

export default function InvitationGuestGroupsDialog({ groups, open, busy, onClose, onSave, onDelete }: {
  groups: InvitationGuestGroup[]; open: boolean; busy: boolean; onClose: () => void;
  onSave: (group: InvitationGuestGroup | null, name: string, onSuccess: () => void) => void;
  onDelete: (group: InvitationGuestGroup) => void;
}) {
  const t = useTranslations("InvitationGuests");
  const id = useId();
  const [editing, setEditing] = useState<InvitationGuestGroup | null>(null);
  const [error, setError] = useState<string>();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("groupName") ?? "").trim();
    if (!name || name.length > 150) { setError(t("validation.groupName")); return; }
    setError(undefined);
    onSave(editing, name, () => { setEditing(null); form.reset(); });
  }
  return <GuestManagementSurface open={open} busy={busy} onClose={onClose} title={t("groups.title")} description={t("groups.description")}>
    {Footer => <div className={styles.groupManagement}>
      <form onSubmit={submit} noValidate className={styles.groupForm}>
        <fieldset disabled={busy} className={styles.fields}>
          <Field id={`${id}-name`} label={t(editing ? "groups.rename" : "groups.new")} error={error} required>
            <Input key={editing?.id ?? "new"} name="groupName" required maxLength={150} defaultValue={editing?.name ?? ""} placeholder={t("groups.placeholder")} />
          </Field>
        </fieldset>
          <Footer>
            {editing && <Button type="button" variant="outline" disabled={busy} onClick={() => { setEditing(null); setError(undefined); }}>{t("cancel")}</Button>}
            <Button type="submit" loading={busy}>{t(editing ? "save" : "groups.create")}</Button>
          </Footer>
      </form>
      {groups.length ? <ul className={styles.groupsList}>{groups.map(group => <li key={group.id} className={styles.groupRow}>
        <span>{group.name}</span><div className={styles.rowActions}>
          <Button variant="ghost" size="sm" disabled={busy} aria-label={t("groups.editNamed", { name: group.name })} onClick={() => { setEditing(group); setError(undefined); }}><Pencil aria-hidden="true" />{t("edit")}</Button>
          <Button variant="outline" size="sm" disabled={busy} aria-label={t("groups.deleteNamed", { name: group.name })} onClick={() => { setEditing(null); onDelete(group); }}><Trash2 aria-hidden="true" />{t("delete")}</Button>
        </div>
      </li>)}</ul> : <p className={styles.help}>{t("groups.empty")}</p>}
    </div>}
  </GuestManagementSurface>;
}
