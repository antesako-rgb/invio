"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge/badge";
import Avatar from "@/components/ui/avatar/Avatar";
import Stepper from "@/components/ui/stepper/Stepper";
import Search from "@/components/ui/search/Search";
import { getInitials } from "@/lib/utils/getInitials";
import type { GuestSurfaceFooter } from "../GuestManagementSurface";
import type { InvitationGuest } from "../../types/invitationGuest.types";
import type { InvitationRecipientWithGuests, CreateInvitationRecipientInput } from "../../types/invitationRecipient.types";
import { recipientFormSchema } from "../../validation/invitationRecipient.schema";
import { recipientGuestName, recipientTextMatchesSearch } from "./recipientPresentation";
import styles from "./InvitationRecipients.module.css";

export default function InvitationRecipientForm({ recipient, guests, assignedGuestIds, busy, Footer, onSave, onCancel }: {
  recipient?: InvitationRecipientWithGuests; guests: InvitationGuest[]; assignedGuestIds: string[]; busy: boolean; Footer: GuestSurfaceFooter;
  onSave: (fields: Omit<CreateInvitationRecipientInput, "p_invitation_id">) => void; onCancel: () => void;
}) {
  const t = useTranslations("Invitations.recipients");
  const id = useId();
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(recipient?.guests.map(guest => guest.id) ?? []);
  const [primary, setPrimary] = useState(recipient?.guests.find(guest => guest.is_primary)?.id ?? "");
  const [email, setEmail] = useState(recipient?.email ?? "");
  const [phone, setPhone] = useState(recipient?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const compositionLocked = !!recipient?.response;
  const originalIds = recipient?.guests.map(guest => guest.id) ?? [];
  const available = guests.filter(guest => !assignedGuestIds.includes(guest.id) && (!compositionLocked || originalIds.includes(guest.id)));
  const chosen = available.filter(guest => selected.includes(guest.id));
  const visible = available.filter(guest => recipientTextMatchesSearch(recipientGuestName(guest), query));
  const primaryGuest = chosen.find(guest => guest.id === primary);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (step === 0) {
      if (!chosen.length) { setErrors({ p_guest_ids: t("validation.guests") }); return; }
      setErrors({}); setStep(1); return;
    }
    const parsed = recipientFormSchema.safeParse({ p_email: email, p_phone: phone, p_guest_ids: chosen.map(guest => guest.id), p_primary_guest_id: primary });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], t(issue.message === "contact" ? "validation.contact" : issue.path[0] === "p_guest_ids" ? "validation.guests" : issue.path[0] === "p_primary_guest_id" ? "validation.primary" : "validation.contactLength")] )));
      setStep(chosen.length ? 1 : 0); return;
    }
    setErrors({});
    if (step === 1) { setEmail(parsed.data.p_email ?? ""); setPhone(parsed.data.p_phone ?? ""); setStep(2); return; }
    onSave(parsed.data);
  }
  return <form noValidate onSubmit={submit} className={styles.flowForm}>
    <div className={styles.formBody}>
      <div className={styles.stepper}><Stepper steps={["guests", "settings", "review"].map((key, index) => ({ label: t(`steps.${key}`), active: index === step, completed: index < step }))} /></div>
      <fieldset disabled={busy} className={styles.fields}>
        {step === 0 && <>
          <p className={styles.hint}>{t(compositionLocked ? "compositionLocked" : "guestsHelp")}</p>
          <Search value={query} onValueChange={setQuery} placeholder={t("guestSearch")} ariaLabel={t("guestSearch")} clearLabel={t("clearSearch")} disabled={busy} />
          <fieldset className={styles.guestChoices}>
            <legend>{t("guests")}</legend>
            {visible.length ? visible.map(guest => <label className={styles.choice} key={guest.id}>
              <input type="checkbox" disabled={compositionLocked} checked={selected.includes(guest.id)} onChange={event => { setSelected(current => event.target.checked ? [...current, guest.id] : current.filter(value => value !== guest.id)); if (!event.target.checked && primary === guest.id) setPrimary(""); setErrors({}); }} />
              <span aria-hidden="true"><Avatar alt={recipientGuestName(guest)} fallback={getInitials(recipientGuestName(guest))} size="xs" /></span><span>{recipientGuestName(guest)}</span>
            </label>) : <p className={styles.hint}>{t(available.length ? "noSearchResults" : "noneAvailable")}</p>}
          </fieldset>
          {errors.p_guest_ids && <p className={styles.error} role="alert">{errors.p_guest_ids}</p>}
        </>}
        {step === 1 && <>
          <Field id={`${id}-primary`} label={t("primary")} description={t("primaryHelp")} required error={errors.p_primary_guest_id}>
            <Select value={primary} onValueChange={setPrimary} options={[{ value: "", label: t("choosePrimary") }, ...chosen.map(guest => ({ value: guest.id, label: recipientGuestName(guest) }))]} />
          </Field>
          <Field id={`${id}-email`} label={t("email")} description={t("contactHelp")} error={errors.p_email}><Input type="text" inputMode="email" maxLength={320} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></Field>
          <Field id={`${id}-phone`} label={t("phone")} error={errors.p_phone}><Input type="tel" maxLength={50} autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></Field>
        </>}
        {step === 2 && <div className={styles.summary}>
          <h3>{t("reviewTitle")}</h3><p className={styles.hint}>{t("reviewHelp")}</p>
          <p className={styles.primaryName}>{primaryGuest ? recipientGuestName(primaryGuest) : t("choosePrimary")}</p>
          <ul className={styles.linkedGuests}>{chosen.map(guest => <li key={guest.id}><span>{recipientGuestName(guest)}</span>{guest.id === primary && <Badge variant="soft">{t("primary")}</Badge>}</li>)}</ul>
          <p className={styles.hint}>{email || "—"}</p><p className={styles.hint}>{phone || "—"}</p>
        </div>}
      </fieldset>
    </div>
    <Footer className={styles.stickyFooter}>
      <Button type="button" variant="outline" disabled={busy} onClick={() => { if (step) { setErrors({}); setStep(step - 1); } else onCancel(); }}>{t(step ? "back" : "cancel")}</Button>
      <Button type="submit" loading={busy}>{t(step === 2 ? recipient ? "save" : "createFinal" : "next")}</Button>
    </Footer>
  </form>;
}
