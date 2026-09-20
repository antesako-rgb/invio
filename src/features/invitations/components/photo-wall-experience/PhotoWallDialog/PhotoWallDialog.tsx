"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

import "./PhotoWallDialog.css";


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
  disabled = false,
}: PhotoWallDialogProps) {
  /* ==========================================================================
     Refs
  ========================================================================== */

  const anchorRef =
    useRef<HTMLSpanElement>(
      null
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    portalContainer,
    setPortalContainer,
  ] =
    useState<HTMLElement | null>(
      null
    );


  /* ==========================================================================
     Portal Container
  ========================================================================== */

  useEffect(
    () => {
      const experience =
        anchorRef.current?.closest<HTMLElement>(
          "[data-event-experience]"
        ) ??
        null;

      setPortalContainer(
        experience
      );
    },
    []
  );


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
    <>
      <span
        ref={
          anchorRef
        }
        hidden
        aria-hidden="true"
      />

      <Dialog
        open={
          open
        }
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogPortal
          container={
            portalContainer
          }
        >
          <DialogOverlay
            className="photo-wall-dialog__overlay"
          />

          <DialogPrimitive.Popup
            className="photo-wall-dialog"
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
              className="photo-wall-dialog__body"
            >
              {children}
            </div>
          </DialogPrimitive.Popup>
        </DialogPortal>
      </Dialog>
    </>
  );
}