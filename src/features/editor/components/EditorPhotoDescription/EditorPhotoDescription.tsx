"use client";
import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
export default function EditorPhotoDescription({ value, onSave, disabled, legacy = false, onReset, compact = false }: {
  value?: string | null; onSave: (value: string) => Promise<void>; disabled?: boolean;
  compact?: boolean; legacy?: boolean; onReset?: () => void;
}) {
  const t = useTranslations("Common.photoDescription");
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const lock = useRef(false);
  async function save() {
    if (lock.current || disabled) return;
    lock.current = true; setBusy(true); setFailed(false);
    try { if (draft !== (value ?? "")) await onSave(draft); setOpen(false); }
    catch { setFailed(true); }
    finally { lock.current = false; setBusy(false); }
  }
  return <>
    <Button type="button" variant="outline" size={compact ? "icon" : "default"} title={t(legacy ? "legacy" : "edit")} aria-label={t(legacy ? "legacy" : "edit")} disabled={disabled} onClick={() => { setDraft(value ?? ""); setFailed(false); setOpen(true); }}>
      <Pencil aria-hidden="true" />{!compact && t(legacy ? "legacy" : "edit")}
    </Button>
    <Dialog open={open} onOpenChange={next => { if (!lock.current) setOpen(next); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t(legacy ? "legacy" : "edit")}</DialogTitle><DialogDescription>{t(legacy ? "legacyHint" : "hint")}</DialogDescription></DialogHeader>
        <Label htmlFor={id}>{t("label")}</Label>
        <Textarea id={id} rows={4} maxLength={legacy ? undefined : 300} value={draft} disabled={busy || disabled} onChange={event => setDraft(event.target.value)} />
        {failed && <p role="alert">{t("error")}</p>}
        {onReset && <Button variant="outline" disabled={busy || disabled} onClick={() => { onReset(); setOpen(false); }}>{t("reset")}</Button>}
        <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>{t("cancel")}</Button>
        <Button disabled={busy || disabled} loading={busy} onClick={() => void save()}>{t("save")}</Button>
      </DialogContent>
    </Dialog>
  </>;
}
