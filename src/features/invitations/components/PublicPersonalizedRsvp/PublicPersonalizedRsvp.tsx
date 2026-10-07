"use client";

import InvitationRsvpChoice from "../invitation-renderer/InvitationRsvpChoice";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge/badge";
import { useActionError } from "@/lib/actions/useActionError";
import type { PublicRsvp } from "../../types/publicRsvp.types";
import { submitPersonalizedRsvpSchema } from "../../validation/publicRsvp.schema";
import { submitPersonalizedRsvpAction } from "../../actions/rsvp/submitPersonalizedRsvpAction";
import styles from "./PublicPersonalizedRsvp.module.css";
import { getInvitationRsvp, validateInvitationRsvpAnswers } from "../../utils/invitationRsvp";
import type { RsvpAnswers } from "../../types/invitationDocument.types";
import type { Json } from "@/lib/supabase/database.types";

export default function PublicPersonalizedRsvp({ token, context }: { token: string; context: PublicRsvp }) {
  const t = useTranslations("Invitations.publicRsvp");
  const actionError = useActionError();
  const id = useId();
  const builder = useTranslations("Invitations.rsvpBuilder");
  const rsvpPage = context.invitation.document.pages.find(page => page.type === "rsvp");
  const config = getInvitationRsvp(rsvpPage, { label: builder("attendance"), attendingLabel: builder("attending"), notAttendingLabel: builder("notAttending") });
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(context.guests.map(guest => [guest.invitation_guest_id, guest.status ?? ""])));
  const [answers, setAnswers] = useState<Record<string, RsvpAnswers>>(Object.fromEntries(context.guests.map(guest => [guest.invitation_guest_id, Object.fromEntries(config.questions.map(question => { const value = guest.answers?.[question.id]; return [question.id, typeof value === "string" ? value : ""]; }))])));
  const [retainedAnswers, setRetainedAnswers] = useState<Record<string, Record<string, Json>>>(Object.fromEntries(context.guests.map(guest => [guest.invitation_guest_id, guest.answers ?? {}])));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, startTransition] = useTransition();
  const lock = useRef(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const parsed = submitPersonalizedRsvpSchema.safeParse({ p_token: token, p_guests: context.guests.map(guest => ({ invitation_guest_id: guest.invitation_guest_id, status: statuses[guest.invitation_guest_id], answers: statuses[guest.invitation_guest_id] === "not_attending" ? {} : { ...retainedAnswers[guest.invitation_guest_id], ...answers[guest.invitation_guest_id] } })) });
    if (!parsed.success) { setError(t("chooseAll")); return; }
    try { validateInvitationRsvpAnswers(config.questions, parsed.data.p_guests); }
    catch { setError(builder("answersRequired")); return; }
    setError(null); lock.current = true;
    startTransition(async () => {
      try {
        const result = await submitPersonalizedRsvpAction(parsed.data);
        if (!result.success) { setError(actionError(result.code)); return; }
        setSaved(true);
      } catch { setError(t("failed")); }
      finally { lock.current = false; }
    });
  }
  return <div className={styles.form}>
      {saved ? <div role="status" className={styles.success}><h2>{t("successTitle")}</h2><p>{t("successDescription")}</p><Button variant="secondary" onClick={() => setSaved(false)}>{t("review")}</Button></div> : <>
        {context.recipient.has_response && <p className={styles.hint}>{t("existing")}</p>}
        {!context.guests.length ? <p className={styles.hint}>{t("noGuests")}</p> : <form onSubmit={submit} noValidate>
          <fieldset disabled={busy} className={styles.fields}>
            {context.guests.map((guest, index) => <div key={guest.invitation_guest_id} className={styles.guestFields}>
              <h3 className={styles.guestName}>{[guest.first_name, guest.last_name].filter(Boolean).join(" ") || t("unnamed")}{guest.is_primary && <Badge variant="soft">{t("primary")}</Badge>}</h3>
              <Field id={`${id}-${index}`} required label={config.attendance.label}>
              <Select value={statuses[guest.invitation_guest_id]} onValueChange={value => { setStatuses(current => ({ ...current, [guest.invitation_guest_id]: value })); if (value === "not_attending") { setAnswers(current => ({ ...current, [guest.invitation_guest_id]: Object.fromEntries(config.questions.map(question => [question.id, ""])) })); setRetainedAnswers(current => ({ ...current, [guest.invitation_guest_id]: {} })); } setError(null); }} options={[{ value: "", label: t("choose") }, { value: "attending", label: config.attendance.attendingLabel }, { value: "not_attending", label: config.attendance.notAttendingLabel }]} />
              </Field>
              {statuses[guest.invitation_guest_id] === "attending" && config.questions.map(question => {
                const props = { value: answers[guest.invitation_guest_id]?.[question.id] ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const value = event.target.value; setAnswers(current => ({ ...current, [guest.invitation_guest_id]: { ...current[guest.invitation_guest_id], [question.id]: value } })); setError(null); } };
                return <Field key={question.id} id={`${id}-${index}-${question.id}`} label={question.label} required={question.required}>{question.type === "choice" ? <InvitationRsvpChoice question={question} value={answers[guest.invitation_guest_id]?.[question.id] ?? ""} disabled={busy} onChange={value => { setAnswers(current => ({ ...current, [guest.invitation_guest_id]: { ...current[guest.invitation_guest_id], [question.id]: value } })); setError(null); }} /> : question.type === "short_text" ? <Input {...props} /> : <Textarea rows={3} {...props} />}</Field>;
              })}
            </div>)}
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <Button type="submit" loading={busy}>{t("submit")}</Button>
          </fieldset>
        </form>}
      </>}
  </div>;
}
