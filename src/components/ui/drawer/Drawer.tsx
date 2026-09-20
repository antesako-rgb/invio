"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import {
  Drawer as DrawerPrimitive,
} from "@base-ui/react/drawer";

import {
  X,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils/utils";

import styles
  from "./Drawer.module.css";


/* ==========================================================================
   Drawer
========================================================================== */

function Drawer(
  props:
    ComponentProps<
      typeof DrawerPrimitive.Root
    >
) {
  return (
    <DrawerPrimitive.Root
      {...props}
    />
  );
}


/* ==========================================================================
   Drawer Trigger
========================================================================== */

function DrawerTrigger(
  props:
    ComponentProps<
      typeof DrawerPrimitive.Trigger
    >
) {
  return (
    <DrawerPrimitive.Trigger
      {...props}
    />
  );
}


/* ==========================================================================
   Drawer Close
========================================================================== */

function DrawerClose(
  props:
    ComponentProps<
      typeof DrawerPrimitive.Close
    >
) {
  return (
    <DrawerPrimitive.Close
      {...props}
    />
  );
}


/* ==========================================================================
   Drawer Content
========================================================================== */

interface DrawerContentProps
  extends ComponentProps<
    typeof DrawerPrimitive.Popup
  > {
  children:
    ReactNode;

  showCloseButton?:
    boolean;
}

function DrawerContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Viewport
        className={
          styles.viewport
        }
      >
        <DrawerPrimitive.Popup
          className={cn(
            styles.popup,
            className
          )}
          {...props}
        >
          <div
            className={
              styles.dragArea
            }
          >
            <div
              className={
                styles.handle
              }
              aria-hidden="true"
            />
          </div>

          <DrawerPrimitive.Content
            className={
              styles.content
            }
          >
            {children}
          </DrawerPrimitive.Content>

          {showCloseButton && (
            <DrawerPrimitive.Close
              className={
                styles.close
              }
              aria-label="Close"
            >
              <X
                size={20}
                aria-hidden="true"
              />
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}


/* ==========================================================================
   Drawer Header
========================================================================== */

interface DrawerHeaderProps {
  children:
    ReactNode;

  className?:
    string;
}

function DrawerHeader({
  children,
  className,
}: DrawerHeaderProps) {
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
   Drawer Footer
========================================================================== */

interface DrawerFooterProps {
  children:
    ReactNode;

  className?:
    string;
}

function DrawerFooter({
  children,
  className,
}: DrawerFooterProps) {
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
   Drawer Title
========================================================================== */

function DrawerTitle({
  className,
  ...props
}: ComponentProps<
  typeof DrawerPrimitive.Title
>) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        styles.title,
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Drawer Description
========================================================================== */

function DrawerDescription({
  className,
  ...props
}: ComponentProps<
  typeof DrawerPrimitive.Description
>) {
  return (
    <DrawerPrimitive.Description
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
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};