"use client";
import { useId } from "react";
import type { RsvpQuestion } from "../../types/invitationDocument.types";
import styles from "./InvitationRsvpChoice.module.css";
export default function InvitationRsvpChoice({ question, value = "", disabled = false, onChange }: { question: RsvpQuestion; value?: string; disabled?: boolean; onChange?: (value: string) => void }) {
  const name = useId();
  return <div role="radiogroup" aria-label={question.label} aria-required={question.required} className={styles.options}>
    {(question.options ?? []).map(option => <label key={option.id} className={styles.option}><input type="radio" name={name} value={option.id} checked={value === option.id} disabled={disabled} onChange={() => onChange?.(option.id)} /><span>{option.label}</span></label>)}
  </div>;
}
