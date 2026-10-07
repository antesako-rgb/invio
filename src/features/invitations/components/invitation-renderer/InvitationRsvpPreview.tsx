"use client";

import InvitationRsvpChoice from "./InvitationRsvpChoice";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getInvitationRsvp } from "../../utils/invitationRsvp";
import type { InvitationDocumentPage } from "../../types/invitationDocument.types";
import styles from "./InvitationRsvpPreview.module.css";
import { useInvitationRsvpSlot } from "./InvitationRsvpSlot";
import surface from "./InvitationRsvpSurface.module.css";

export default function InvitationRsvpPreview({ page }: { page: InvitationDocumentPage }) {
  const t = useTranslations("Invitations.rsvpBuilder");
  const config = getInvitationRsvp(page, { label: t("attendance"), attendingLabel: t("attending"), notAttendingLabel: t("notAttending") });
  const content = useInvitationRsvpSlot();
  if (content !== undefined) return content === null ? null : <div className={surface.surface}>{content}</div>;
  return <fieldset disabled className={`${styles.preview} ${surface.surface}`} aria-label={t("preview")}>
    <Field label={config.attendance.label}><Select defaultValue="attending" options={[{ value: "attending", label: config.attendance.attendingLabel }, { value: "not_attending", label: config.attendance.notAttendingLabel }]} /></Field>
    {config.questions.map(question => <Field key={question.id} label={question.label} required={question.required}>{question.type === "choice" ? <InvitationRsvpChoice question={question} disabled /> : question.type === "short_text" ? <Input /> : <Textarea rows={3} />}</Field>)}
  </fieldset>;
}
