"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import EditorPhotoFraming from "@/features/editor/components/EditorPhotoFraming/EditorPhotoFraming";
import type { DigitalAlbumPhotoSlot } from "../../../types/digitalAlbumDocument.types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import styles from "./DigitalAlbumPhotoPositionEditor.module.css";

interface DigitalAlbumPhotoPositionEditorProps {
  slot: DigitalAlbumPhotoSlot;
  imageUrl: string;
  aspectRatio: number;
  allowContain: boolean;
  inheritedCaption?: string | null;
  onApply: (slot: DigitalAlbumPhotoSlot) => void;
  onCancel: () => void;
}

/* ==========================================================================
   Album adapter: caption and slot persistence remain Album responsibilities
========================================================================== */

export default function DigitalAlbumPhotoPositionEditor({
  slot, imageUrl, aspectRatio, allowContain, inheritedCaption, onApply, onCancel,
}: DigitalAlbumPhotoPositionEditorProps) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const captionId = useId();
  const [caption, setCaption] = useState(slot.caption);

  return (
    <EditorPhotoFraming
      value={slot}
      imageUrl={imageUrl}
      aspectRatio={aspectRatio}
      allowContain={allowContain}
      labels={{
        position: t("position"), positionHelp: t("positionHelp"),
        horizontal: t("horizontal"), vertical: t("vertical"), contain: t("contain"),
        reset: t("reset"), cancel: t("cancel"), apply: t("apply"),
      }}
      onApply={framing => onApply({ ...slot, ...framing, ...(caption !== undefined ? { caption } : {}) })}
      onCancel={onCancel}
    >
      <div className={styles.caption}>
        <Label htmlFor={captionId}>{t("caption")}</Label>
        <Textarea
          id={captionId}
          rows={2}
          value={caption ?? inheritedCaption ?? ""}
          onChange={event => setCaption(event.target.value)}
        />
      </div>
    </EditorPhotoFraming>
  );
}
