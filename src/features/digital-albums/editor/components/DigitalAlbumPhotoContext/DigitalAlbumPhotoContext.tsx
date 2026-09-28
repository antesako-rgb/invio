"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowLeftRight, Crop, Replace, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DigitalAlbumPhotoSlot } from "../../../types/digitalAlbumDocument.types";
import styles from "./DigitalAlbumPhotoContext.module.css";

interface Props {
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

export default function DigitalAlbumPhotoContext({ label, imageUrl, slots, activeSlotId, disabled, canCrop, onBack, onChoose, onCrop, onRemove, onSwap }: Props) {
  const t = useTranslations("DigitalAlbumEditor.photoContext");
  const backButton = useRef<HTMLButtonElement>(null);
  const destinations = slots.filter(({ slot }) => slot.photoId && slot.id !== activeSlotId);
  useEffect(() => {
    const element = backButton.current;
    if (!element?.getClientRects().length) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest" });
  }, [activeSlotId]);

  return (
    <section className={styles.root} aria-label={t("selectedPhoto")}>
      <Button ref={backButton} type="button" variant="ghost" className={styles.back} disabled={disabled} onClick={onBack}>
        <ArrowLeft aria-hidden="true" />{t("back")}
      </Button>
      <p className={styles.label}>{label}</p>
      <div className={styles.thumbnail}>
        {imageUrl
          ? <Image src={imageUrl} alt="" fill sizes="280px" />
          : <p role="status">{t("missing")}</p>}
      </div>
      <div className={styles.actions}>
        <Button type="button" disabled={disabled} onClick={onChoose}><Replace aria-hidden="true" />{t("replace")}</Button>
        <Button type="button" variant="outline" disabled={disabled || !canCrop} onClick={onCrop}><Crop aria-hidden="true" />{t("crop")}</Button>
        {destinations.length > 0 && <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>
            <ArrowLeftRight aria-hidden="true" />{t("swap")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={styles.swapMenu}>
            {destinations.map(({ slot, number }) => <DropdownMenuItem className={styles.swapOption} key={slot.id} onClick={() => onSwap(slot.id)}>
              <ArrowLeftRight aria-hidden="true" />
              {t("slot", { number })}
            </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>}
        <Button type="button" variant="outline" className={styles.remove} disabled={disabled} onClick={onRemove}>
          <Trash2 aria-hidden="true" />{t("remove")}
        </Button>
      </div>
    </section>
  );
}
