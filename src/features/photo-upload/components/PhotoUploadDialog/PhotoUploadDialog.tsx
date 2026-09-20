"use client";

import type {
  ReactNode,
} from "react";

import {
  Dialog,
  DialogCloseButton,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog/dialog";

import {
  Dialog as DialogPrimitive,
} from "@base-ui/react/dialog";

import styles
  from "./PhotoUploadDialog.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoUploadDialogProps {
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

  disabled?:
    boolean;
}


/* ==========================================================================
   Photo Upload Dialog
========================================================================== */

export default function PhotoUploadDialog({
  open,
  onOpenChange,
  children,
  closeLabel,
  disabled = false,
}: PhotoUploadDialogProps) {
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
        <DialogOverlay />

        <DialogPrimitive.Popup
          className={
            styles.dialog
          }
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
            className={
              styles.body
            }
          >
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}