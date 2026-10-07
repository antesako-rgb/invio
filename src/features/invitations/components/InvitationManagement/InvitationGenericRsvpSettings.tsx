"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useActionError } from "@/lib/actions/useActionError";
import type { Invitation } from "../../types/invitation.types";
import { invitationRsvpSettingsSchema } from "../../validation/invitationRsvpSettings.schema";
import { updateInvitationRsvpSettingsAction } from "../../actions/invitation/updateInvitationRsvpSettingsAction";
import styles from "./InvitationGenericRsvpSettings.module.css";

export default function InvitationGenericRsvpSettings({ invitation }: { invitation: Pick<Invitation, "id" | "generic_rsvp_enabled" | "generic_rsvp_max_guests" | "generic_rsvp_capacity"> }) {
  const t = useTranslations("Invitations.genericRsvpSettings");
  const actionError = useActionError();
  const id = useId();
  const [enabled, setEnabled] = useState(invitation.generic_rsvp_enabled);
  const [maxGuests, setMaxGuests] = useState(String(invitation.generic_rsvp_max_guests));
  const [limited, setLimited] = useState(invitation.generic_rsvp_capacity !== null);
  const [capacity, setCapacity] = useState(invitation.generic_rsvp_capacity === null ? "" : String(invitation.generic_rsvp_capacity));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, startTransition] = useTransition();
  const lock = useRef(false);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const parsed = invitationRsvpSettingsSchema.safeParse({ p_invitation_id: invitation.id, p_generic_rsvp_enabled: enabled, p_generic_rsvp_max_guests: maxGuests.trim() ? Number(maxGuests) : NaN, p_generic_rsvp_capacity: limited ? capacity.trim() ? Number(capacity) : NaN : null });
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], t("validation")]))); return; }
    setErrors({}); lock.current = true;
    startTransition(async () => {
      try {
        const result = await updateInvitationRsvpSettingsAction(parsed.data);
        if (!result.success) { toast.error(actionError(result.code)); return; }
        toast.success(t("saved"));
      } catch { toast.error(t("failed")); }
      finally { lock.current = false; }
    });
  }
  return <Card className={styles.card}>
    <div><h2>{t("title")}</h2><p className={styles.hint}>{t("description")}</p></div>
    <form noValidate onSubmit={save}>
      <fieldset disabled={busy} className={styles.fields}>
        <div className={styles.toggle}><div><label htmlFor={`${id}-enabled`}>{t("enabled")}</label><p id={`${id}-enabled-help`} className={styles.hint}>{t("enabledHelp")}</p></div>
          <Switch id={`${id}-enabled`} checked={enabled} onCheckedChange={setEnabled} disabled={busy} aria-describedby={`${id}-enabled-help`} />
        </div>
        <Field id={`${id}-max`} label={t("maxGuests")} description={t("maxGuestsHelp")} required error={errors.p_generic_rsvp_max_guests}>
          <Input type="number" min={1} step={1} inputMode="numeric" value={maxGuests} onChange={event => setMaxGuests(event.target.value)} />
        </Field>
        <Field id={`${id}-mode`} label={t("capacity")} description={t("capacityHelp")}>
          <Select value={limited ? "limited" : "unlimited"} onValueChange={value => { setLimited(value === "limited"); setErrors({}); }} options={[{ value: "unlimited", label: t("unlimited") }, { value: "limited", label: t("limited") }]} />
        </Field>
        {limited && <Field id={`${id}-capacity`} label={t("capacityLimit")} required error={errors.p_generic_rsvp_capacity}>
          <Input type="number" min={1} step={1} inputMode="numeric" value={capacity} onChange={event => setCapacity(event.target.value)} />
        </Field>}
        <p className={styles.hint}>{t("guestHelp")}</p>
        <div className={styles.actions}><Button type="submit" loading={busy}>{t("save")}</Button></div>
      </fieldset>
    </form>
  </Card>;
}
