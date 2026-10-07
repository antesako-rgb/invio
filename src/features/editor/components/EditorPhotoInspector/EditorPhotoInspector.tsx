"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { ArrowLeft, ArrowLeftRight, Crop, Replace, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import styles from "./EditorPhotoInspector.module.css";

interface Props {
  descriptionControl?: ReactNode;
  label: string;
  imageUrl?: string;
  destinations?: { id: string; label: string }[];
  labels: Record<"selectedPhoto" | "back" | "missing" | "replace" | "crop" | "swap" | "remove", string>;
  activeSlotId: string;
  disabled: boolean;
  canCrop: boolean;
  onBack: () => void;
  onChoose: () => void;
  onCrop: () => void;
  onRemove: () => void;
  onSwap?: (targetId: string) => void;
}

export default function EditorPhotoInspector({ label, imageUrl, destinations = [], labels, activeSlotId, disabled, canCrop, onBack, onChoose, onCrop, onRemove, onSwap, descriptionControl }: Props) {
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = backButton.current;
    if (!element?.getClientRects().length) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest" });
  }, [activeSlotId]);

  return (
    <section className={styles.root} aria-label={labels.selectedPhoto}>
      <Button ref={backButton} type="button" variant="ghost" className={styles.back} disabled={disabled} onClick={onBack}>
        <ArrowLeft aria-hidden="true" />{labels.back}
      </Button>
      <p className={styles.label}>{label}</p>
      <div className={styles.thumbnail}>
        {imageUrl
          ? <Image src={imageUrl} alt="" fill sizes="280px" />
          : <p role="status">{labels.missing}</p>}
      </div>
      <div className={styles.actions}>
        {descriptionControl}
        <Button type="button" variant="secondary" disabled={disabled} onClick={onChoose}><Replace aria-hidden="true" />{labels.replace}</Button>
        <Button type="button" variant="outline" disabled={disabled || !canCrop} onClick={onCrop}><Crop aria-hidden="true" />{labels.crop}</Button>
        {onSwap && destinations.length > 0 && <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="ghost" disabled={disabled} />}>
            <ArrowLeftRight aria-hidden="true" />{labels.swap}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={styles.swapMenu}>
            {destinations.map(destination => <DropdownMenuItem className={styles.swapOption} key={destination.id} onClick={() => onSwap(destination.id)}>
              <ArrowLeftRight aria-hidden="true" />
              {destination.label}
            </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>}
        <Button type="button" variant="outline" className={styles.remove} disabled={disabled} onClick={onRemove}>
          <Trash2 aria-hidden="true" />{labels.remove}
        </Button>
      </div>
    </section>
  );
}
