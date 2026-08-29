"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import * as TooltipPrimitive
  from "@radix-ui/react-tooltip";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./tooltip.module.css";


/* ==========================================================================
   Tooltip Provider
========================================================================== */

interface TooltipProviderProps {
  children:
    ReactNode;
}

export function TooltipProvider({
  children,
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={300}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}


/* ==========================================================================
   Tooltip
========================================================================== */

interface TooltipProps {
  children:
    ReactNode;
}

export function Tooltip({
  children,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      {children}
    </TooltipPrimitive.Root>
  );
}


/* ==========================================================================
   Tooltip Trigger
========================================================================== */

interface TooltipTriggerProps {
  children:
    ReactNode;

  asChild?:
    boolean;
}

export function TooltipTrigger({
  children,
  asChild = false,
}: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      asChild={
        asChild
      }
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}


/* ==========================================================================
   Tooltip Content
========================================================================== */

interface TooltipContentProps
  extends ComponentProps<
    typeof TooltipPrimitive.Content
  > {}

export function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 8,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={
          side
        }
        sideOffset={
          sideOffset
        }
        className={cn(
          styles.content,
          className
        )}
        {...props}
      >
        {children}

        <TooltipPrimitive.Arrow
          className={
            styles.arrow
          }
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}