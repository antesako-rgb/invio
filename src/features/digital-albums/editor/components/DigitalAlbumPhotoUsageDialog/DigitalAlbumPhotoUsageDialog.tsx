"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import type { DigitalAlbumPhotoReference } from "../../../utils/digitalAlbumPhotoReferences";
import styles from "./DigitalAlbumPhotoUsageDialog.module.css";

interface Props {
  imageUrl?: string;
  references: DigitalAlbumPhotoReference[];
  onClose: () => void;
  onNavigate: (reference: DigitalAlbumPhotoReference) => void;
  deleting: boolean;
  busy: boolean;
  onDelete: () => Promise<boolean>;
}

export default function DigitalAlbumPhotoUsageDialog({ imageUrl, references, onClose, onNavigate, deleting, busy, onDelete }: Props) {
  const t = useTranslations("DigitalAlbumEditor.photoUsage");
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !confirm && !busy) onClose(); }}>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t(deleting ? "description" : "infoDescription", { count: references.length })}</DialogDescription>
          </DialogHeader>
          <div className={styles.content}>
            {imageUrl && <div className={styles.preview}><Image src={imageUrl} alt="" fill sizes="(max-width: 600px) 96px, 240px" /></div>}
            <div className={styles.locations}>
              <p className={styles.label}>{t("locations")}</p>
              <ul className={styles.list}>
                {references.map((reference) => (
                  <li key={reference.slotId}>
                    <Button type="button" variant="ghost" className={styles.location} disabled={busy} onClick={() => onNavigate(reference)}>
                      <span>{t("page", { number: reference.pageNumber })}{reference.retained && <small>{t("retained")}</small>}</span>
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.actions}>
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t("cancel")}</Button>
            {deleting && <Button type="button" variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>
              <Trash2 aria-hidden="true" />{t("removeAll")}
            </Button>}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={confirm} loading={busy} variant="danger" title={t("confirmTitle")}
        description={t("confirmDescription", { count: references.length })}
        confirmText={t("confirm", { count: references.length })} cancelText={t("cancel")}
        onClose={() => { if (!busy) setConfirm(false); }} onConfirm={async () => { if (await onDelete()) setConfirm(false); }} />
    </>
  );
}
