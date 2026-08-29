"use client";

import * as React from "react";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils/utils";

import styles from "./Popover.module.css";

export const Popover =
  PopoverPrimitive.Root;

export const PopoverTrigger =
  PopoverPrimitive.Trigger;

type PopoverContentProps =
  React.ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Popup
  > & {
    sideOffset?: number;
  };

export function PopoverContent({
  children,
  className,
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        sideOffset={sideOffset}
        className={styles.positioner}
      >
        <PopoverPrimitive.Popup
          className={cn(
            styles.content,
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}