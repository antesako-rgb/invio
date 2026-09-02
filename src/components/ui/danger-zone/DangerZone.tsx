"use client";

import { useState } from "react";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

import {
  Button,
  type ButtonVariant,
} from "@/components/ui/button";

import ConfirmDialog, {
  type ConfirmDialogVariant,
} from "@/components/ui/common/ConfirmDialog";

import styles from "./DangerZone.module.css";

interface DangerZoneProps {
  title?: string;

  description: ReactNode;

  buttonText: string;

  buttonVariant?: ButtonVariant;

  tone?: "default" | "danger";

  confirmTitle: string;

  confirmDescription: ReactNode;

  confirmText: string;

  cancelText?: string;

  dialogVariant?: ConfirmDialogVariant;

  loading?: boolean;

  onConfirm: () => void | Promise<void>;
}

export default function DangerZone({
  title = "Opasna zona",
  description,

  buttonText,
  buttonVariant = "destructive",

  tone = "default",

  confirmTitle,
  confirmDescription,
  confirmText,
  cancelText = "Odustani",

  dialogVariant = "danger",

  loading = false,

  onConfirm,
}: DangerZoneProps) {
  const [open, setOpen] =
    useState(false);

  async function handleConfirm() {
    await onConfirm();

    setOpen(false);
  }

  return (
    <>
      <section
        className={cn(
          styles.card,
          tone === "danger" &&
            styles.cardDanger
        )}
      >
        <div className={styles.content}>
          <h2
            className={cn(
              styles.title,
              tone === "danger" &&
                styles.titleDanger
            )}
          >
            {title}
          </h2>

          <p className={styles.description}>
            {description}
          </p>
        </div>

        <Button
          variant={buttonVariant}
          className={styles.button}
          disabled={loading}
          onClick={() =>
            setOpen(true)
          }
        >
          {buttonText}
        </Button>
      </section>

      <ConfirmDialog
        open={open}
        variant={dialogVariant}
        title={confirmTitle}
        description={
          confirmDescription
        }
        confirmText={confirmText}
        cancelText={cancelText}
        loading={loading}
        onConfirm={handleConfirm}
        onClose={() =>
          setOpen(false)
        }
      />
    </>
  );
}