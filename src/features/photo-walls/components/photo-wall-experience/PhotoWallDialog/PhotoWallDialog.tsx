"use client";

import type {
  ReactNode,
} from "react";

import {
  Dialog as DialogPrimitive,
} from "@base-ui/react/dialog";

import {
  Dialog,
  DialogCloseButton,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog/dialog";

import styles from "./PhotoWallDialog.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallDialogProps {
  open:
    boolean;

  onOpenChange:
    (
      open:
        boolean
    ) => void;

  children:
    ReactNode;

  closeLabel:
    string;

  color:
    string;

  disabled?:
    boolean;
}


/* ==========================================================================
   Photo Wall Dialog
========================================================================== */

export default function PhotoWallDialog({
  open,
  onOpenChange,
  children,
  closeLabel,
  color,
  disabled = false,
}: PhotoWallDialogProps) {
  /* ==========================================================================
     Open Change
  ========================================================================== */

  function handleOpenChange(
    nextOpen:
      boolean
  ) {
    if (
      disabled &&
      !nextOpen
    ) {
      return;
    }

    onOpenChange(
      nextOpen
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogPortal>
        <DialogOverlay
          className={styles.overlay}
        />

        <DialogPrimitive.Popup
          className={styles.dialog}
          data-photo-wall-experience
          data-color={
            color
          }
          data-photo-wall-dialog
        >
          <DialogCloseButton
            disabled={
              disabled
            }
            aria-label={
              closeLabel
            }
          />

          <div
            className={styles.body}
          >
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}