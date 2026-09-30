"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import styles from "./EditorEditableText.module.css";
export interface EditorEditableTextProps {
  labels: { edit: string; cancel: string; apply: string };
  attributes?: React.HTMLAttributes<HTMLSpanElement>;
  valueAttributes?: React.HTMLAttributes<HTMLSpanElement>;
  maxLength?: number;
  value?: string;
  displayValue?: string;
  placeholder: string;
  editable?: boolean;
  showPlaceholder?: boolean;
  className?: string;
  onApply?: (value: string) => void;
}
export default function EditorEditableText({
  value,
  labels,
  attributes,
  valueAttributes,
  maxLength,
  displayValue,
  placeholder,
  editable = false,
  showPlaceholder = editable,
  className,
  onApply,
}: EditorEditableTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const editingRef = useRef(false);
  const applied = useRef(false);
  const [editing, setEditing] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [draft, setDraft] = useState("");
  function finish(cancel = false) {
    if (!editingRef.current) return;
    editingRef.current = false;
    const raw = cancel ? (value ?? "") : (ref.current?.innerText.trim() ?? "");
    const next = maxLength ? raw.slice(0, maxLength) : raw;
    setEditing(false);
    if (ref.current)
      ref.current.textContent = next || (showPlaceholder ? placeholder : "");
    if (!cancel && next !== (value ?? "")) onApply?.(next);
  }
  useEffect(() => {
    if (!editing) return;
    const blurOutside = (event: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(event.target as Node))
        ref.current?.blur();
    };
    document.addEventListener("pointerdown", blurOutside, true);
    return () => document.removeEventListener("pointerdown", blurOutside, true);
  }, [editing]);
  function start() {
    applied.current = false;
    if (window.matchMedia("(max-width: 768px)").matches) {
      setDraft(value ?? "");
      setMobile(true);
      return;
    }
    editingRef.current = true;
    setEditing(true);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.textContent = value ?? "";
      ref.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }
  // Empty editor prompts must not reserve space in public/print layouts.
  if (!editable && !showPlaceholder && !value?.trim()) return null;

  return (
    <>
      <span
        className={[styles.root, className].filter(Boolean).join(" ")}
        {...attributes}
        data-editable={editable || undefined}
        data-editing={editing || undefined}
        data-placeholder={!value?.trim() || undefined}
      >
        <span
          ref={ref}
          {...valueAttributes}
          className={styles.value}
          contentEditable={editing ? "plaintext-only" : false}
          role={editing ? "textbox" : undefined}
          aria-label={editing ? placeholder : undefined}
          aria-multiline={editing || undefined}
          suppressContentEditableWarning
          tabIndex={editing ? 0 : undefined}
          onBlur={() => finish()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              finish(true);
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              ref.current?.blur();
            }
          }}
          onPointerDown={(event) => {
            if (editing) event.stopPropagation();
          }}
          onMouseDown={(event) => {
            if (editing) event.stopPropagation();
          }}
        >
          {editing ? null : value?.trim() ? (displayValue ?? value) : showPlaceholder ? placeholder : ""}
        </span>
        {editable && !editing && (
          <button
            type="button"
            className={styles.interaction}
            aria-label={`${labels.edit}: ${placeholder}`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              start();
            }}
          />
        )}
      </span>
    <Dialog
  open={mobile}
  onOpenChange={setMobile}
>
  <DialogContent
    className={styles.mobileDialog}
  >
    <DialogHeader>
      <DialogTitle>
        {labels.edit}
      </DialogTitle>
    </DialogHeader>

    <Textarea
      autoFocus
      className={styles.mobileInput}
      aria-label={placeholder}
      maxLength={maxLength}
      value={draft}
      onChange={(event) =>
        setDraft(event.target.value)
      }
    />

    <div className={styles.mobileActions}>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setMobile(false)
        }
      >
        {labels.cancel}
      </Button>

      <Button
        type="button"
        onClick={() => {
          if (applied.current) return;
          applied.current = true;
          const next = maxLength ? draft.trim().slice(0, maxLength) : draft.trim();

          if (
            next !==
            (value ?? "")
          ) {
            onApply?.(next);
          }

          setMobile(false);
        }}
      >
        {labels.apply}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </>
  );
}
