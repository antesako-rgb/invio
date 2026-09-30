"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import EditorPhotoInspector from "@/features/editor/components/EditorPhotoInspector/EditorPhotoInspector";
import type { DigitalAlbumPhotoSlot } from "../../../types/digitalAlbumDocument.types";
interface Props {
  descriptionControl?: ReactNode;
  label: string;
  imageUrl?: string;
  slots: { slot: DigitalAlbumPhotoSlot; number: number }[];
  activeSlotId: string;
  disabled: boolean;
  canCrop: boolean;
  onBack: () => void;
  onChoose: () => void;
  onCrop: () => void;
  onRemove: () => void;
  onSwap: (targetId: string) => void;
}

export default function DigitalAlbumPhotoContext({ slots, ...props }: Props) {
  const t = useTranslations("DigitalAlbumEditor.photoContext");
  return <EditorPhotoInspector {...props}
    destinations={slots.filter(({ slot }) => slot.photoId && slot.id !== props.activeSlotId).map(({ slot, number }) => ({ id: slot.id, label: t("slot", { number }) }))}
    labels={{ selectedPhoto: t("selectedPhoto"), back: t("back"), missing: t("missing"), replace: t("replace"), crop: t("crop"), swap: t("swap"), remove: t("remove") }} />;
}
