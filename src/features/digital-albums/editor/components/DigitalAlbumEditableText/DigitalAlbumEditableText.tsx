"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import styles from "./DigitalAlbumEditableText.module.css";
interface Props {
  value?: string;
  placeholder: string;
  editable?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}
export default function DigitalAlbumEditableText({
  value,
  placeholder,
  editable = false,
  className,
  onChange,
}: Props) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const ref = useRef<HTMLSpanElement>(null);
  const editingRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [draft, setDraft] = useState("");
  function finish(cancel = false) {
    if (!editingRef.current) return;
    editingRef.current = false;
    const next = cancel ? (value ?? "") : (ref.current?.innerText.trim() ?? "");
    setEditing(false);
    if (ref.current)
      ref.current.textContent = next || (editable ? placeholder : "");
    if (!cancel && next !== (value ?? "")) onChange?.(next);
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
  return (
    <>
      <span
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-album-text
        data-opf-no-flip={editable || undefined}
        data-editable={editable || undefined}
        data-editing={editing || undefined}
        data-placeholder={!value?.trim() || undefined}
      >
        <span
          ref={ref}
          data-album-text-value
          className={styles.value}
          contentEditable={editing}
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
          {editing ? null : value?.trim() ? value : editable ? placeholder : ""}
        </span>
        {editable && !editing && (
          <button
            type="button"
            className={styles.interaction}
            aria-label={value || placeholder}
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
        {t("editText")}
      </DialogTitle>
    </DialogHeader>

    <Textarea
      autoFocus
      className={styles.mobileInput}
      aria-label={t("editText")}
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
        {t("cancel")}
      </Button>

      <Button
        type="button"
        onClick={() => {
          const next =
            draft.trim();

          if (
            next !==
            (value ?? "")
          ) {
            onChange?.(next);
          }

          setMobile(false);
        }}
      >
        {t("apply")}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </>
  );
}
