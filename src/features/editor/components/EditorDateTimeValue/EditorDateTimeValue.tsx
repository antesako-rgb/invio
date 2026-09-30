"use client";
import { useRef, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/picker/DatePicker";
import { TimePicker } from "@/components/ui/picker/TimePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover/Popover";
import { Button } from "@/components/ui/button";
import { editorDateSelectionSchema, editorTimeValueSchema, parseEditorDate } from "./dateTimeValidation";
import styles from "./EditorDateTimeValue.module.css";

interface Props {
  kind: "date" | "time";
  value?: string | null;
  display?: ReactNode;
  label: string;
  hint?: string;
  disabled?: boolean;
  disablePast?: boolean;
  labels: { clear: string; cancel: string; apply: string; invalid: string };
  onApply: (value: string) => void;
}

/** Canvas presentation only. Domain ownership and persistence stay in the adapter. */
export default function EditorDateTimeValue({ kind, value, display, label, hint, disabled, disablePast = false, labels, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const applied = useRef(false);
  function changeOpen(next: boolean) {
    if (next) {
      applied.current = false;
      setDraft(editorTimeValueSchema.safeParse(value ?? "").success ? value ?? "" : "");
      setError(false);
    }
    setOpen(next);
  }
  function apply(next: string) {
    if (applied.current || disabled) return;
    applied.current = true;
    if (next !== (value ?? "")) onApply(next);
    setOpen(false);
  }
  const trigger = <button type="button" className={styles.trigger} disabled={disabled} aria-label={label}>
    {display ?? (value || label)}
  </button>;
  const footer = <div className={styles.footer}>
    {hint && <p>{hint}</p>}
    {error && <p role="alert">{labels.invalid}</p>}
    {Boolean(value) && <Button type="button" variant="ghost" disabled={disabled} onClick={() => apply("")}>{labels.clear}</Button>}
  </div>;
  if (kind === "date") return <DatePicker
    trigger={trigger} footer={footer}
    value={parseEditorDate(value)}
    open={open} onOpenChange={changeOpen}
    disabled={disabled} disablePast={disablePast}
    onChange={date => {
      const result = editorDateSelectionSchema(disablePast).safeParse(date);
      if (!result.success) { setError(true); return; }
      apply(result.data ? format(result.data, "yyyy-MM-dd") : "");
    }} />;
  return <Popover open={open} onOpenChange={changeOpen}>
    <PopoverTrigger disabled={disabled} render={trigger} />
    <PopoverContent className={styles.popover} aria-label={label}>
      <p className={styles.title}>{label}</p>
      <TimePicker value={draft || null} onChange={next => setDraft(next ?? "")} minuteStep={1} disabled={disabled} clearable />
      {footer}
      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>{labels.cancel}</Button>
        <Button type="button" disabled={disabled} onClick={() => {
          const result = editorTimeValueSchema.safeParse(draft);
          if (!result.success) { setError(true); return; }
          apply(result.data);
        }}>{labels.apply}</Button>
      </div>
    </PopoverContent>
  </Popover>;
}
