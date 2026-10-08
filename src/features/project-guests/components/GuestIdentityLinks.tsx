"use client";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import type { ProjectGuest } from "../types/database";
import { linkGenericGuestAction, unlinkGenericGuestAction } from "../actions/guestLinks";
import { guestOptions } from "../utils/guestOptions";
import styles from "./GuestIdentityLinks.module.css";

export default function GuestIdentityLinks({ people, responseGuestId, linkedPersonId }: {
  people: ProjectGuest[]; responseGuestId: string; linkedPersonId?: string;
}) {
  const t = useTranslations("InvitationGuests.identity");
  const [selected, setSelected] = useState("");
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [busy, start] = useTransition();
  const lock = useRef(false);
  function run(action: () => Promise<{ success: boolean }>) {
    if (lock.current) return;
    lock.current = true;
    start(async () => {
      try {
        const result = await action();
        if (!result.success) toast.error(t("error"));
        else { toast.success(t("saved")); setSelected(""); setConfirmUnlink(false); }
      } catch { toast.error(t("error")); }
      finally { lock.current = false; }
    });
  }
  const options = guestOptions(people.filter(person => !person.archived_at));
  const linked = people.find(person => person.id === linkedPersonId);
  return <div className={styles.links}>
    {linkedPersonId ? <>
      <span>{t("linked", { name: linked ? [linked.first_name, linked.last_name].filter(Boolean).join(" ") : t("unavailable") })}</span>
      {linked?.archived_at && <span>{t("archived")}</span>}
      <Button variant="outline" disabled={busy} onClick={() => setConfirmUnlink(true)}>{t("unlink")}</Button>
      <ConfirmDialog open={confirmUnlink} title={t("unlinkTitle")} description={t("unlinkHelp")} confirmText={t("unlink")} cancelText={t("cancel")} loading={busy}
        onClose={() => { if (!lock.current) setConfirmUnlink(false); }} onConfirm={() => run(() => unlinkGenericGuestAction(responseGuestId))} />
    </> : <>
      <p className={styles.help}>{t("genericHelp")}</p>
      <Select aria-label={t("select")} value={selected} onValueChange={value => setSelected(value ?? "")} options={[{ value: "", label: t("select") }, ...options]} />
      <div className={styles.actions}>
        <Button disabled={busy || !selected} variant="outline" onClick={() => run(() => linkGenericGuestAction({ responseGuestId, guestId: selected, createNew: false }))}>{t("existing")}</Button>
        <Button disabled={busy} onClick={() => run(() => linkGenericGuestAction({ responseGuestId, guestId: null, createNew: true }))}>{t("new")}</Button>
      </div>
    </>}
  </div>;
}
