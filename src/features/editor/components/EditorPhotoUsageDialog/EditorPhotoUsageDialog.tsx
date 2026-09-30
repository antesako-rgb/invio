"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import styles from "./EditorPhotoUsageDialog.module.css";

interface Props {
  imageUrl?: string;
  references: { id: string; label: string; hint?: string }[];
  labels: { title: string; description: string; locations: string; cancel: string; removeAll: string; confirmTitle: string; confirmDescription: string; confirm: string };
  error?: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
  deleting: boolean;
  busy: boolean;
  onDelete: () => Promise<boolean>;
}

export default function EditorPhotoUsageDialog({ imageUrl, references, onClose, onNavigate, deleting, busy, onDelete, labels, error }: Props) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !confirm && !busy) onClose(); }}>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>
          <div className={styles.content}>
            {imageUrl && <div className={styles.preview}><Image src={imageUrl} alt="" fill sizes="(max-width: 600px) 96px, 240px" /></div>}
            <div className={styles.locations}>
              <p className={styles.label}>{labels.locations}</p>
              <ul className={styles.list}>
                {references.map((reference) => (
                  <li key={reference.id}>
                    <Button type="button" variant="ghost" className={styles.location} disabled={busy} onClick={() => onNavigate(reference.id)}>
                      <span>{reference.label}{reference.hint && <small>{reference.hint}</small>}</span>
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {error && <p role="alert">{error}</p>}
          <div className={styles.actions}>
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{labels.cancel}</Button>
            {deleting && <Button type="button" variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>
              <Trash2 aria-hidden="true" />{labels.removeAll}
            </Button>}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={confirm} loading={busy} variant="danger" title={labels.confirmTitle}
        description={error ? `${labels.confirmDescription} ${error}` : labels.confirmDescription}
        confirmText={labels.confirm} cancelText={labels.cancel}
        onClose={() => { if (!busy) setConfirm(false); }} onConfirm={async () => { if (await onDelete()) setConfirm(false); }} />
    </>
  );
}
