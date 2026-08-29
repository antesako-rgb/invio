"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import {
  Dialog,
} from "@base-ui/react/dialog";

import {
  X,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./Sheet.module.css";


/* ==========================================================================
   Sheet
========================================================================== */

function Sheet(
  props: ComponentProps<
    typeof Dialog.Root
  >
) {
  return (
    <Dialog.Root
      {...props}
    />
  );
}


/* ==========================================================================
   Sheet Trigger
========================================================================== */

function SheetTrigger(
  props: ComponentProps<
    typeof Dialog.Trigger
  >
) {
  return (
    <Dialog.Trigger
      {...props}
    />
  );
}


/* ==========================================================================
   Sheet Close
========================================================================== */

function SheetClose(
  props: ComponentProps<
    typeof Dialog.Close
  >
) {
  return (
    <Dialog.Close
      {...props}
    />
  );
}


/* ==========================================================================
   Sheet Content
========================================================================== */

interface SheetContentProps
  extends ComponentProps<
    typeof Dialog.Popup
  > {
  side?:
    | "top"
    | "right"
    | "bottom"
    | "left";

  showCloseButton?:
    boolean;
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={
          styles.backdrop
        }
      />

      <Dialog.Popup
        data-side={
          side
        }
        className={cn(
          styles.content,
          styles[side],
          className
        )}
        {...props}
      >
        <div
          className={
            styles.mobileHandle
          }
          aria-hidden="true"
        >
          <span />
        </div>

        {children}

        {showCloseButton && (
          <Dialog.Close
            className={
              styles.close
            }
            aria-label="Close"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </Dialog.Close>
        )}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}


/* ==========================================================================
   Sheet Header
========================================================================== */

interface SheetHeaderProps {
  children:
    ReactNode;

  className?:
    string;
}

function SheetHeader({
  children,
  className,
}: SheetHeaderProps) {
  return (
    <div
      className={cn(
        styles.header,
        className
      )}
    >
      {children}
    </div>
  );
}


/* ==========================================================================
   Sheet Footer
========================================================================== */

interface SheetFooterProps {
  children:
    ReactNode;

  className?:
    string;
}

function SheetFooter({
  children,
  className,
}: SheetFooterProps) {
  return (
    <div
      className={cn(
        styles.footer,
        className
      )}
    >
      {children}
    </div>
  );
}


/* ==========================================================================
   Sheet Title
========================================================================== */

function SheetTitle({
  className,
  ...props
}: ComponentProps<
  typeof Dialog.Title
>) {
  return (
    <Dialog.Title
      className={cn(
        styles.title,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Sheet Description
========================================================================== */

function SheetDescription({
  className,
  ...props
}: ComponentProps<
  typeof Dialog.Description
>) {
  return (
    <Dialog.Description
      className={cn(
        styles.description,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Exports
========================================================================== */

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};