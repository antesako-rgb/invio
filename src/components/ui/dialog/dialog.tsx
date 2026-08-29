"use client";

import * as React from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils/utils";

function Dialog({
  ...props
}: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      {...props}
    />
  );
}

function DialogTrigger({
  ...props
}: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

function DialogPortal({
  ...props
}: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/25 backdrop-blur-[2px]",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />

<DialogPrimitive.Popup
  data-slot="dialog-content"
  className={cn(
    "fixed left-1/2 top-1/2 z-50",
    "-translate-x-1/2 -translate-y-1/2",

    "w-[calc(100vw-2rem)]",
    "max-w-2xl",

    "max-h-[90vh]",
    "overflow-y-auto",

    "rounded-2xl",

    // Surface
    "bg-dialog",

    // Border
    "border border-border/70",

    // Shadow
    "shadow-lg",

    // Ring
    "ring-1 ring-border/30",

    // Blur
    "backdrop-blur-xl",

    // Padding
    "p-4 sm:p-6",

    // Focus
    "outline-none",

    // Animation
    "data-open:animate-in",
    "data-open:fade-in-0",
    "data-open:zoom-in-95",
    "data-open:duration-200",

    "data-closed:animate-out",
    "data-closed:fade-out-0",
    "data-closed:zoom-out-95",
    "data-closed:duration-150",

    className
  )}
  {...props}
>


        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "mb-6 flex flex-col gap-2",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Title
>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Description
>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm leading-6 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "mt-6 flex flex-wrap justify-end gap-2",
        className
      )}
      {...props}
    />
  );
}

function DialogClose({
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};