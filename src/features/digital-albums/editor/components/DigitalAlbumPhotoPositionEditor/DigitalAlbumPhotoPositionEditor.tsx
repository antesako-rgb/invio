"use client";

import { useTranslations } from "next-intl";
import EditorPhotoFraming from "@/features/editor/components/EditorPhotoFraming/EditorPhotoFraming";
import type { DigitalAlbumPhotoSlot } from "../../../types/digitalAlbumDocument.types";

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
  slot, imageUrl, aspectRatio, allowContain, onApply, onCancel,
}: DigitalAlbumPhotoPositionEditorProps) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");

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
      onApply={framing => onApply({ ...slot, ...framing})}
      onCancel={onCancel}
    />
  );
}
