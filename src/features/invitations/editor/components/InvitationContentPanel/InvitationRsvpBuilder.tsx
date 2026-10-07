"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Ellipsis } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditorEditableText from "@/features/editor/components/EditorEditableText/EditorEditableText";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { getInvitationRsvp } from "../../../utils/invitationRsvp";
import type { InvitationDocumentPage, InvitationRsvpConfiguration, RsvpQuestion } from "../../../types/invitationDocument.types";
import styles from "./InvitationRsvpBuilder.module.css";

export default function InvitationRsvpBuilder({ page, disabled, onChange }: { page: InvitationDocumentPage; disabled: boolean; onChange: (update: (page: InvitationDocumentPage) => InvitationDocumentPage) => void }) {
  const t = useTranslations("Invitations.rsvpBuilder");
  const id = useId();
  const editor = useTranslations("Invitations");
  const labels = { edit: editor("textEditing.edit"), cancel: editor("cancel"), apply: editor("framing.apply") };
  const defaults = { label: t("attendance"), attendingLabel: t("attending"), notAttendingLabel: t("notAttending") };
  const config = getInvitationRsvp(page, defaults);
  function update(change: (config: InvitationRsvpConfiguration) => InvitationRsvpConfiguration) {
    onChange(current => ({ ...current, rsvp: change(getInvitationRsvp(current, defaults)) }));
  }
  function question(questionId: string, values: Partial<RsvpQuestion>) { update(current => ({ ...current, questions: current.questions.map(item => item.id === questionId ? { ...item, ...values } : item) })); }
  function move(questionId: string, offset: number) {
    update(current => { const questions = [...current.questions]; const from = questions.findIndex(item => item.id === questionId); const to = from + offset;
      if (from < 0 || to < 0 || to >= questions.length) return current;
      [questions[from], questions[to]] = [questions[to], questions[from]];
      return { ...current, questions };
    });
  }
  function editable(value: string, label: string, onApply: (value: string) => void) {
    return <EditorEditableText value={value} placeholder={label} labels={labels} editable={!disabled} maxLength={10000} onApply={onApply} />;
  }
  return <div className={styles.builder}>
    <div className={styles.attendance}>
      {editable(config.attendance.label, t("label"), label => update(current => ({ ...current, attendance: { ...current.attendance, label } })))}
      <div className={styles.row}>{(["attendingLabel", "notAttendingLabel"] as const).map(key => <div key={key} className={styles.option}>{editable(config.attendance[key], t(key), value => update(current => ({ ...current, attendance: { ...current.attendance, [key]: value } })))}</div>)}</div>
    </div>
    <ol className={styles.questions}>{config.questions.map((item, index) => <li key={item.id}>
      <div className={styles.questionHeader}><div>{editable(item.label, t("questionLabel"), value => { const label = value.trim(); if (!label) toast.error(t("labelRequired")); else question(item.id, { label }); })}{item.required && <span aria-label={t("required")} className={styles.required}> *</span>}</div>
      <DropdownMenu><DropdownMenuTrigger disabled={disabled} render={<Button type="button" size="icon" variant="ghost" aria-label={t("questionActions", { label: item.label })} />}><Ellipsis aria-hidden="true" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={disabled} onClick={() => question(item.id, { type: "short_text" })}>{t("shortText")}</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onClick={() => question(item.id, { type: "long_text" })}>{t("longText")}</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onClick={() => question(item.id, { type: "choice", options: item.options?.length ? item.options : [{ id: crypto.randomUUID(), label: t("newOption") }] })}>{t("choice")}</DropdownMenuItem>
          <DropdownMenuCheckboxItem disabled={disabled} checked={item.required} onCheckedChange={required => question(item.id, { required })}>{t("required")}</DropdownMenuCheckboxItem>
          <DropdownMenuItem disabled={disabled || index === 0} onClick={() => move(item.id, -1)}><ArrowUp aria-hidden="true" />{t("up")}</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled || index === config.questions.length - 1} onClick={() => move(item.id, 1)}><ArrowDown aria-hidden="true" />{t("down")}</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} variant="destructive" onClick={() => update(current => ({ ...current, questions: current.questions.filter(question => question.id !== item.id) }))}><Trash2 aria-hidden="true" />{t("delete")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu></div>
      {item.type === "choice" ? <div className={styles.options}>
        {(item.options ?? []).map((option, optionIndex) => <div key={option.id} className={styles.questionHeader}><div className={styles.optionLabel}><span aria-hidden="true">?</span>{editable(option.label, t("optionLabel"), value => { const label = value.trim(); if (!label) toast.error(t("labelRequired")); else question(item.id, { options: item.options?.map(current => current.id === option.id ? { ...current, label } : current) }); })}</div>
          <DropdownMenu><DropdownMenuTrigger disabled={disabled} render={<Button type="button" size="icon" variant="ghost" aria-label={t("optionActions", { label: option.label })} />}><Ellipsis aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent align="end">
            <DropdownMenuItem disabled={disabled || optionIndex === 0} onClick={() => { const options = [...(item.options ?? [])]; [options[optionIndex - 1], options[optionIndex]] = [options[optionIndex], options[optionIndex - 1]]; question(item.id, { options }); }}>{t("up")}</DropdownMenuItem>
            <DropdownMenuItem disabled={disabled || optionIndex === (item.options?.length ?? 0) - 1} onClick={() => { const options = [...(item.options ?? [])]; [options[optionIndex + 1], options[optionIndex]] = [options[optionIndex], options[optionIndex + 1]]; question(item.id, { options }); }}>{t("down")}</DropdownMenuItem>
            <DropdownMenuItem disabled={disabled || (item.options?.length ?? 0) <= 1} variant="destructive" onClick={() => question(item.id, { options: item.options?.filter(current => current.id !== option.id) })}>{t("deleteOption")}</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>
        </div>)}
        <Button type="button" variant="ghost" disabled={disabled} onClick={() => question(item.id, { options: [...(item.options ?? []), { id: crypto.randomUUID(), label: t("newOption") }] })}><Plus aria-hidden="true" />{t("addOption")}</Button>
      </div> : <Field id={`${id}-${item.id}`} label={t(item.type === "short_text" ? "shortText" : "longText")}>
        {item.type === "short_text" ? <Input disabled /> : <Textarea disabled rows={3} />}
      </Field>}
    </li>)}</ol>
    <Button type="button" disabled={disabled} variant="secondary" onClick={() => { const item: RsvpQuestion = { id: crypto.randomUUID(), type: "short_text", label: t("newQuestion"), required: false }; update(current => ({ ...current, questions: [...current.questions, item] })); }}><Plus aria-hidden="true" />{t("add")}</Button>
    <p className={styles.hint}>{t("attendingOnly")}</p>
  </div>;
}
