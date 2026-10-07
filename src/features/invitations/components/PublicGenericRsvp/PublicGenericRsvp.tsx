"use client";
import InvitationRsvpChoice from "../invitation-renderer/InvitationRsvpChoice";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { InvitationDocumentPage } from "../../types/invitationDocument.types";
import { getInvitationRsvp } from "../../utils/invitationRsvp";
import { submitGenericRsvpSchema, validateGenericAnswers } from "../../validation/genericRsvp.schema";
import { submitGenericRsvpAction } from "../../actions/rsvp/submitGenericRsvpAction";
import styles from "./PublicGenericRsvp.module.css";
type Draft = { id: string; first_name: string; last_name: string; status: string; answers: Record<string, string> };
function blank(id: string): Draft { return { id, first_name: "", last_name: "", status: "", answers: {} }; }
export default function PublicGenericRsvp({ publicId, page, maxGuests }: { publicId: string; page: InvitationDocumentPage; maxGuests: number }) {
  const t = useTranslations("Invitations.genericRsvp");
  const builder = useTranslations("Invitations.rsvpBuilder");
  const id = useId();
  const config = getInvitationRsvp(page, { label: builder("attendance"), attendingLabel: builder("attending"), notAttendingLabel: builder("notAttending") });
  const [guests, setGuests] = useState<Draft[]>([blank("first")]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, startTransition] = useTransition();
  const lock = useRef(false);
  function update(guestId: string, values: Partial<Draft>) { setGuests(current => current.map(guest => guest.id === guestId ? { ...guest, ...values } : guest)); setError(null); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || saved) return;
    const parsed = submitGenericRsvpSchema.safeParse({ p_public_id: publicId, p_guests: guests.map(({ first_name, last_name, status, answers }) => ({ first_name, last_name, status, answers })) });
    if (!parsed.success) { setError("invalid"); return; }
    if (guests.length > maxGuests) { setError("limit"); return; }
    let payload;
    try { payload = { ...parsed.data, p_guests: validateGenericAnswers(config.questions, parsed.data.p_guests) }; }
    catch { setError("required"); return; }
    setError(null); lock.current = true;
    startTransition(async () => {
      try {
        const result = await submitGenericRsvpAction(payload);
        if (result.success) setSaved(true);
        else setError(result.code === "RSVP_CAPACITY_EXCEEDED" ? "capacity" : result.code === "RSVP_GUEST_LIMIT_EXCEEDED" ? "limit" : result.code === "RSVP_UNAVAILABLE" ? "unavailable" : result.code === "RSVP_ANSWERS_INVALID" ? "required" : result.code === "INVALID_INPUT" ? "invalid" : "failed");
      } catch { setError("failed"); }
      finally { lock.current = false; }
    });
  }
  if (saved) return <div role="status" className={styles.form}><p>{t("success")}</p><p>{t("successDescription")}</p></div>;
  return <form onSubmit={submit} noValidate className={styles.form}><fieldset disabled={busy} className={styles.fields}>
    {guests.map((guest, index) => <fieldset key={guest.id} className={styles.guest}><legend>{t("person", { number: index + 1 })}</legend>
      <Field id={`${id}-${guest.id}-first`} required label={t("firstName")}><Input maxLength={100} autoComplete="given-name" value={guest.first_name} onChange={event => update(guest.id, { first_name: event.target.value })} /></Field>
      <Field id={`${id}-${guest.id}-last`} label={t("lastName")}><Input maxLength={100} autoComplete="family-name" value={guest.last_name} onChange={event => update(guest.id, { last_name: event.target.value })} /></Field>
      <Field id={`${id}-${guest.id}-status`} required label={config.attendance.label}><Select value={guest.status} options={[{ value: "", label: t("choose") }, { value: "attending", label: config.attendance.attendingLabel }, { value: "not_attending", label: config.attendance.notAttendingLabel }]} onValueChange={status => update(guest.id, { status, ...(status === "not_attending" ? { answers: {} } : {}) })} /></Field>
      {guest.status === "attending" && config.questions.map(question => { const props = { value: guest.answers[question.id] ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(guest.id, { answers: { ...guest.answers, [question.id]: event.target.value } }) }; return <Field key={question.id} id={`${id}-${guest.id}-${question.id}`} required={question.required} label={question.label}>{question.type === "choice" ? <InvitationRsvpChoice question={question} value={guest.answers[question.id] ?? ""} disabled={busy} onChange={value => update(guest.id, { answers: { ...guest.answers, [question.id]: value } })} /> : question.type === "short_text" ? <Input {...props} /> : <Textarea rows={3} {...props} />}</Field>; })}
      {index > 0 && <Button type="button" variant="ghost" onClick={() => { setGuests(current => current.filter(item => item.id !== guest.id)); setError(null); }}>{t("remove")}</Button>}
    </fieldset>)}
    <Button type="button" variant="secondary" disabled={guests.length >= maxGuests} onClick={() => { if (guests.length < maxGuests) setGuests(current => [...current, blank(crypto.randomUUID())]); }}>{t("add")}</Button>
    <p className={styles.hint}>{t("maxGuests", { count: maxGuests })}</p>
    {error && <p role="alert" className={styles.error}>{t(error)}</p>}
    <Button type="submit" loading={busy}>{t("submit")}</Button>
  </fieldset></form>;
}
